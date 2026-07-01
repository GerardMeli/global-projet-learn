package com.example.manage_users.service.impl

import com.example.manage_users.dto.SocialAuthData
import com.example.manage_users.dto.SocialAuthResponse
import com.example.manage_users.dto.SocialUserSummary
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import com.example.manage_users.models.Users
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.FirebaseAuthService
import com.example.manage_users.service.interf.SocialAuthService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SocialAuthService
 *
 *  Orchestration complète du login social :
 *   1. Vérifie le token Firebase (délégué à FirebaseAuthService)
 *   2. Résout l'utilisateur en base (cherche par firebaseUid puis par email)
 *   3. Crée le compte si nouveau, fusionne si email déjà existant
 *   4. Génère et retourne le JWT applicatif habituel
 *
 *  Stratégie de résolution utilisateur :
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │ Cherche par firebaseUid                                         │
 *   │   → trouvé  : met à jour le profil (photo, etc.) et continue   │
 *   │   → pas trouvé : cherche par email                             │
 *   │       → trouvé  : FUSION (lie le compte local au social)       │
 *   │       → pas trouvé : CRÉATION d'un nouveau compte              │
 *   └─────────────────────────────────────────────────────────────────┘
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Service
class SocialAuthServiceImpl (
    private val firebaseAuthService: FirebaseAuthService,
    private val userRepository: UsersRepository,
    private val jwtService: JwtProvider           // Ton service JWT existant
) : SocialAuthService {

    private val log = LoggerFactory.getLogger(SocialAuthServiceImpl::class.java)

    /**
     * Point d'entrée principal appelé par le controller.
     *
     * @param idToken Token Firebase brut envoyé par le frontend
     * @return SocialAuthResponse contenant le JWT applicatif et les infos user
     * @throws IllegalArgumentException si le token est invalide
     * @throws IllegalStateException si le compte est bloqué/suspendu
     */
    @Transactional
    override fun authenticateWithSocial(idToken: String): SocialAuthResponse {

        // ── 1. Valider le token Firebase ─────────────────────────────────
        val firebaseToken = firebaseAuthService.verifyIdToken(idToken)

        val uid      = firebaseToken.uid
        val email    = firebaseAuthService.extractEmail(firebaseToken)
        val provider = firebaseAuthService.extractProvider(firebaseToken)
        val fullName = firebaseToken.name ?: ""
        val picture  = firebaseToken.picture    // URL de la photo de profil
        val (firstName, lastName) = splitName(fullName)

        log.info("Tentative de connexion sociale — provider: $provider, email: $email")

        // ── 2. Résoudre l'utilisateur en base ────────────────────────────
        var isNewUser = false

        // Étape 2a : cherche par firebaseUid (identifiant stable et unique)
        var user = userRepository.findByFirebaseUid(uid).orElse(null)

        if (user == null) {
            // Étape 2b : cherche par email (peut exister via inscription classique)
            val existingByEmail = userRepository.findByEmail(email).orElse(null)

            user = if (existingByEmail != null) {
                // ── Fusion : compte local existant → on lui ajoute le social ──
                log.info("Fusion du compte existant (email: $email) avec provider: $provider")
                mergeExistingAccount(existingByEmail, uid, provider, picture, firstName, lastName)
            } else {
                // ── Création : nouveau compte social ─────────────────────
                log.info("Création d'un nouveau compte social pour: $email")
                isNewUser = true
                createSocialAccount(email, firstName, lastName, picture, uid, provider)
            }
        } else {
            // ── Mise à jour du profil existant (photo, emailVerified) ─────
            user = refreshSocialProfile(user, picture)
        }

        // ── 3. Vérifier que le compte est actif ──────────────────────────
        if (user.status != UserStatus.ACTIVE) {
            val reason = when (user.status) {
                UserStatus.BLOCKED   -> "bloqué"
                UserStatus.SUSPENDED -> "suspendu"
                UserStatus.DELETED   -> "supprimé"
                UserStatus.INACTIVE  -> "inactif"
                UserStatus.PENDING_VERIFICATION  -> "attent de verification"
                else                   -> "non actif"
            }
            throw IllegalStateException("Compte $reason")
        }

        // ── 4. Générer le JWT applicatif ─────────────────────────────────
        // On utilise generateTokenWithClaims pour inclure le rôle et le userId
        // afin que JwtAuthenticationFilter puisse les lire directement
        val jwt = jwtService.generateTokenWithClaims(
            userId = user.id,
            email = user.email,
            role = user.role.name
        )

        val expiresIn = jwtService.getTokenExpirationSeconds()

        log.info("Connexion sociale réussie — userId: ${user.id}, isNewUser: $isNewUser")

        return SocialAuthResponse(
            data = SocialAuthData(
                token = jwt,
                tokenType = "Bearer",
                expiresIn = expiresIn,
                user = SocialUserSummary(
                    id = user.id,
                    email = user.email,
                    firstName = user.firstName,
                    lastName = user.lastName,
                    profilePicture = user.profilePicture,
                    role = user.role.name
                ),
                isNewUser = isNewUser
            )
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Méthodes privées
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fusionne un compte local existant avec un provider social.
     * L'email reste inchangé. On lie le firebaseUid au compte.
     * La photo et le nom ne sont mis à jour que s'ils étaient vides.
     */
    private fun mergeExistingAccount(
        existing: Users,
        uid: String,
        provider: String,
        picture: String?,
        firstName: String,
        lastName: String
    ): Users {
        val updated = existing.copy(
            firebaseUid   = uid,
            authProvider  = provider,
            emailVerified = true,    // Firebase garantit que l'email est vérifié
            // Ne pas écraser les données locales si elles existent déjà
            profilePicture = existing.profilePicture ?: picture,
            firstName = existing.firstName?.ifBlank { firstName },
            lastName  = existing.lastName?.ifBlank  { lastName }
        )
        return userRepository.save(updated)
    }

    /**
     * Crée un nouveau compte utilisateur depuis un provider social.
     * Pas de mot de passe (null), email directement vérifié.
     */
    private fun createSocialAccount(
        email: String,
        firstName: String,
        lastName: String,
        picture: String?,
        uid: String,
        provider: String
    ): Users {
        val newUser = Users(
            email         = email,
            firstName     = firstName,
            lastName      = lastName,
            password      = null,               // Pas de mot de passe pour les comptes sociaux
            profilePicture = picture,
            role           = UserRole.USER,
            status         = UserStatus.ACTIVE,
            firebaseUid    = uid,
            authProvider   = provider,
            emailVerified  = true               // Firebase certifie que l'email est valide
        )
        return userRepository.save(newUser)
    }

    /**
     * Met à jour les informations de profil d'un compte social existant.
     * Synchronise la photo de profil si elle a changé chez le provider.
     */
    private fun refreshSocialProfile(user: Users, newPicture: String?): Users {
        // On ne met à jour que si la photo a changé (évite une écriture inutile)
        if (newPicture != null && newPicture != user.profilePicture) {
            return userRepository.save(user.copy(profilePicture = newPicture))
        }
        return user
    }

    /**
     * Sépare un nom complet "John Doe" en ("John", "Doe").
     * Si un seul mot, firstName = ce mot, lastName = "".
     */
    private fun splitName(fullName: String): Pair<String, String> {
        val parts = fullName.trim().split(" ", limit = 2)
        return Pair(
            parts.getOrElse(0) { "" }.trim(),
            parts.getOrElse(1) { "" }.trim()
        )
    }
}

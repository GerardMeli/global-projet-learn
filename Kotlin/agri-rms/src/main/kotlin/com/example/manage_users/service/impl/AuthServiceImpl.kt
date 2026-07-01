package com.example.manage_users.service.impl

import com.example.manage_users.dto.AuthDto
import com.example.manage_users.execption.BusinessAccessDeniedException
import com.example.manage_users.execption.ExpiredTokenException
import com.example.manage_users.execption.InvalidTokenException
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.models.Users
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.AuthService
import com.example.manage_users.service.interf.EmailService
import com.example.manage_users.service.interf.TokenService
import com.example.manage_users.utils.UserStatus
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.*
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

// ─────────────────────────────────────────────────────────────────────────────
//  AuthServiceImpl
//  S'appuie sur :
//    • JwtProvider     — génération / validation des tokens JWT
//    • TokenService    — abstraction des tokens métier (email, reset, etc.)
//    • EmailService    — envoi des emails transactionnels
//    • AuthenticationManager — délègue à Spring Security la vérification
//                              du mot de passe (UsernamePasswordAuthenticationToken)
// ─────────────────────────────────────────────────────────────────────────────

@Service
@Transactional
class AuthServiceImpl(
    private val authenticationManager: AuthenticationManager,
    private val usersRepository: UsersRepository,
    private val jwtProvider: JwtProvider,
    private val tokenService: TokenService,
    private val emailService: EmailService,
    private val passwordEncoder: PasswordEncoder
) : AuthService {

    companion object {
        private val log = LoggerFactory.getLogger(AuthServiceImpl::class.java)
        private const val MAX_FAILED_ATTEMPTS = 5
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    override fun login(request: AuthDto.LoginRequest): AuthDto.LoginResponse {
        val user = usersRepository.findByEmail(request.email)
            .orElseThrow { ResourceNotFoundException("Aucun compte trouvé pour cet email.") }

        // Vérifications préalables avant d'appeler Spring Security
        when (user.status) {
            UserStatus.DELETED ->
                throw BusinessAccessDeniedException("Ce compte a été supprimé.")
            UserStatus.SUSPENDED ->
                throw BusinessAccessDeniedException("Ce compte est suspendu. Contactez le support.")
            UserStatus.BLOCKED ->
                throw BusinessAccessDeniedException("Ce compte est bloqué suite à trop de tentatives échouées.")
            UserStatus.PENDING_VERIFICATION ->
                throw BusinessAccessDeniedException("Veuillez vérifier votre email avant de vous connecter.")
            UserStatus.PENDING ->
                throw BusinessAccessDeniedException("Votre compte est en attente d'activation.")
            else -> { /* ACTIVE — on continue */ }
        }

        // Authentification via Spring Security
        try {
            authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(request.email, request.password)
            )
        } catch (ex: BadCredentialsException) {
            // Incrémente les tentatives échouées
            usersRepository.incrementFailedLoginAttempts(user.id)
            val attempts = user.failedLoginAttempts + 1

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.status = UserStatus.BLOCKED
                user.isActive = false
                usersRepository.save(user)
                emailService.sendAccountLockedNotification(user)
                throw BusinessAccessDeniedException(
                    "Compte bloqué après $MAX_FAILED_ATTEMPTS tentatives échouées. Contactez le support."
                )
            }

            throw BusinessAccessDeniedException(
                "Mot de passe incorrect. ${MAX_FAILED_ATTEMPTS - attempts} tentative(s) restante(s)."
            )
        } catch (ex: LockedException) {
            throw BusinessAccessDeniedException("Compte verrouillé.")
        } catch (ex: DisabledException) {
            throw BusinessAccessDeniedException("Compte désactivé.")
        }

        // Réinitialise les tentatives après succès
        usersRepository.resetFailedLoginAttempts(user.id)

        // Génère les tokens
        val accessToken = jwtProvider.generateTokenWithClaims(
            userId = user.id,
            email = user.email,
            role = user.role.name
        )
        val refreshToken = jwtProvider.generateRefreshToken(user.email)

        log.info("✅ Login réussi pour : ${user.email} [${user.role}]")

        return AuthDto.LoginResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = jwtProvider.getTokenExpirationSeconds(),
            user = user.toAuthUserInfo()
        )
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    //
    //  Révoque l'access token ET le refresh token en les ajoutant à la blacklist.
    //  Le JwtAuthenticationFilter refusera ces tokens sur toutes les requêtes suivantes.
    //  Le SecurityContext est effacé pour la requête en cours.

    override fun logout(accessToken: String, refreshToken: String?): AuthDto.MessageResponse {

        // Blacklister l'access token
        revokeToken(accessToken, "access")

        // Blacklister le refresh token si fourni
        refreshToken?.let { revokeToken(it, "refresh") }

        // Effacer le contexte de sécurité Spring pour la requête en cours
        SecurityContextHolder.clearContext()

        log.info("✅ Logout réussi")
        return AuthDto.MessageResponse("Déconnexion réussie.")
    }

    // ── REFRESH TOKEN ─────────────────────────────────────────────────────────

    override fun refreshToken(request: AuthDto.RefreshTokenRequest): AuthDto.TokenRefreshResponse {
        val token = request.refreshToken

        if (!jwtProvider.validateToken(token)) {
            throw InvalidTokenException("Refresh token invalide ou expiré.")
        }

        val tokenType = jwtProvider.getTokenTypeFromToken(token)
        if (tokenType != "refresh") {
            throw InvalidTokenException("Ce token n'est pas un refresh token.")
        }

        val email = jwtProvider.getEmailFromToken(token)
            ?: throw InvalidTokenException("Email introuvable dans le token.")

        val user = usersRepository.findByEmail(email)
            .orElseThrow { ResourceNotFoundException("Utilisateur introuvable.") }

        if (!user.isActive || user.status != UserStatus.ACTIVE) {
            throw BusinessAccessDeniedException("Ce compte n'est plus actif.")
        }

        val newAccessToken = jwtProvider.generateTokenWithClaims(
            userId = user.id,
            email = user.email,
            role = user.role.name
        )
        val newRefreshToken = jwtProvider.generateRefreshToken(user.email)

        log.info("🔄 Token rafraîchi pour : ${user.email}")

        return AuthDto.TokenRefreshResponse(
            accessToken = newAccessToken,
            refreshToken = newRefreshToken,
            expiresIn = jwtProvider.getTokenExpirationSeconds()
        )
    }

    // ── FORGOT PASSWORD ───────────────────────────────────────────────────────

    override fun forgotPassword(request: AuthDto.ForgotPasswordRequest): AuthDto.MessageResponse {
        val user = usersRepository.findByEmail(request.email)
            .orElse(null)

        // On répond toujours avec succès pour ne pas révéler
        // si l'email existe ou non (sécurité OWASP)
        if (user == null) {
            log.warn("Forgot password pour email inconnu : ${request.email}")
            return AuthDto.MessageResponse("Si cet email existe, un lien de réinitialisation a été envoyé.")
        }

        val token = tokenService.createPasswordResetToken(user.id, user.email)
        emailService.sendPasswordResetEmailWithToken(user.email, token)

        log.info("📧 Email de reset envoyé à : ${user.email}")

        return AuthDto.MessageResponse("Si cet email existe, un lien de réinitialisation a été envoyé.")
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────────

    override fun resetPassword(request: AuthDto.ResetPasswordRequest): AuthDto.MessageResponse {
        val userId = try {
            // validatePasswordResetToken valide le type et l'expiration du token
            // getUserIdFromToken retourne le String USERS_UUID stocké dans le claim
            tokenService.validatePasswordResetToken(request.token)
            jwtProvider.getUserIdFromToken(request.token)
        } catch (ex: ExpiredTokenException) {
            throw BusinessAccessDeniedException("Le lien de réinitialisation a expiré. Veuillez en demander un nouveau.")
        } catch (ex: InvalidTokenException) {
            throw BusinessAccessDeniedException("Lien de réinitialisation invalide.")
        }

        val user = usersRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Utilisateur introuvable.") }

        user.password = passwordEncoder.encode(request.newPassword)
        // Débloque le compte si bloqué pour mauvais mdp
        if (user.status == UserStatus.BLOCKED) {
            user.status = UserStatus.ACTIVE
            user.isActive = true
        }
        usersRepository.resetFailedLoginAttempts(user.id)
        usersRepository.save(user)

        tokenService.deletePasswordResetToken(request.token)

        log.info("✅ Mot de passe réinitialisé pour : ${user.email}")

        return AuthDto.MessageResponse("Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.")
    }

    // ── SETUP PASSWORD (invitation super_admin) ───────────────────────────────
    //
    //  Appelé quand le user clique sur le lien reçu par email après sa création.
    //  Le token est de type "account_setup" (distinct du password_reset).
    //  Une fois le mot de passe défini, le compte passe en ACTIVE.

    override fun setupPassword(request: AuthDto.SetupPasswordRequest): AuthDto.MessageResponse {
        // 1. Vérifier que les deux mots de passe correspondent
        if (request.newPassword != request.confirmPassword) {
            throw BusinessAccessDeniedException("Les mots de passe ne correspondent pas.")
        }

        // 2. Valider le token account_setup
        val userId = try {
            jwtProvider.validateAccountSetupToken(request.token)
        } catch (ex: ExpiredTokenException) {
            throw BusinessAccessDeniedException("Le lien d'activation a expiré. Contactez votre administrateur.")
        } catch (ex: InvalidTokenException) {
            throw BusinessAccessDeniedException("Lien d'activation invalide.")
        }

        // 3. Récupérer le user
        val user = usersRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Utilisateur introuvable.") }

        // 4. Vérifier que le compte est bien en attente (sécurité : évite la réutilisation du lien)
        if (user.status == UserStatus.ACTIVE) {
            throw BusinessAccessDeniedException("Ce compte est déjà activé. Connectez-vous directement.")
        }

        // 5. Enregistrer le mot de passe et activer le compte
        user.password = passwordEncoder.encode(request.newPassword)
        user.emailVerified = true
        user.status = UserStatus.ACTIVE
        user.isActive = true
        usersRepository.resetFailedLoginAttempts(user.id)
        usersRepository.save(user)

        log.info("✅ Mot de passe initialisé et compte activé pour : ${user.email}")

        return AuthDto.MessageResponse("Mot de passe créé avec succès. Vous pouvez maintenant vous connecter.")
    }

    // ── CHANGE PASSWORD ───────────────────────────────────────────────────────

    override fun changePassword(userId: String, request: AuthDto.ChangePasswordRequest): AuthDto.MessageResponse {
        val user = usersRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Utilisateur introuvable.") }

        if (!passwordEncoder.matches(request.currentPassword, user.password)) {
            throw BusinessAccessDeniedException("Mot de passe actuel incorrect.")
        }

        if (passwordEncoder.matches(request.newPassword, user.password)) {
            throw BusinessAccessDeniedException("Le nouveau mot de passe doit être différent de l'ancien.")
        }

        user.password = passwordEncoder.encode(request.newPassword)
        usersRepository.save(user)

        log.info("✅ Mot de passe changé pour : ${user.email}")

        return AuthDto.MessageResponse("Mot de passe modifié avec succès.")
    }

    // ── VERIFY EMAIL ──────────────────────────────────────────────────────────

    override fun verifyEmail(token: String): AuthDto.MessageResponse {
        val userId = try {
            tokenService.validateEmailVerificationToken(token)
        } catch (ex: ExpiredTokenException) {
            throw BusinessAccessDeniedException("Le lien de vérification a expiré. Veuillez en demander un nouveau.")
        } catch (ex: InvalidTokenException) {
            throw BusinessAccessDeniedException("Lien de vérification invalide.")
        }

        val user = usersRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Utilisateur introuvable.") }

        if (user.emailVerified) {
            return AuthDto.MessageResponse("Cet email est déjà vérifié.")
        }

        usersRepository.verifyEmail(user.id)

        log.info("✅ Email vérifié pour : ${user.email}")

        return AuthDto.MessageResponse("Email vérifié avec succès. Vous pouvez maintenant vous connecter.")
    }

    // ── RESEND VERIFICATION ───────────────────────────────────────────────────

    override fun resendVerificationEmail(email: String): AuthDto.MessageResponse {
        val user = usersRepository.findByEmail(email).orElse(null)

        // Même logique de sécurité : on ne révèle pas si l'email existe
        if (user == null || user.emailVerified) {
            return AuthDto.MessageResponse("Si cet email existe et n'est pas vérifié, un nouveau lien a été envoyé.")
        }

        val token = tokenService.createEmailVerificationToken(user.id)
        emailService.sendVerificationEmail(user.email, token)

        log.info("📧 Email de vérification renvoyé à : ${user.email}")

        return AuthDto.MessageResponse("Si cet email existe et n'est pas vérifié, un nouveau lien a été envoyé.")
    }

    // ── ME ────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    override fun me(userId: String): AuthDto.AuthUserInfo {
        val user = usersRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Utilisateur introuvable.") }
        return user.toAuthUserInfo()
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private fun revokeToken(token: String, label: String) {
        try {
            if (jwtProvider.validateToken(token)) {
                val expiresAt = jwtProvider.getExpirationFromToken(token)
                tokenService.blacklist(token, expiresAt)
                log.debug("$label token revoked")
            }
        } catch (ex: Exception) {
            // Token déjà expiré → inutile de le blacklister
            log.debug("$label token already expired during logout: ${ex.message}")
        }
    }

    private fun Users.toAuthUserInfo() = AuthDto.AuthUserInfo(
        id = id,
        email = email,
        firstName = firstName,
        lastName = lastName,
        role = role.name,
        permission = permission.name,
        emailVerified = emailVerified,
        status = status.name
    )
}
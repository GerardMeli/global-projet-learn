package com.example.manage_users.service.impl

import com.example.manage_users.dto.AgriApiResponse
import com.example.manage_users.dto.AgriUserDto
import com.example.manage_users.dto.MigrationReport
import com.example.manage_users.dto.MigrationResultat
import com.example.manage_users.mapper.UserMapper
import com.example.manage_users.models.UserExternalRef
import com.example.manage_users.models.Users
import com.example.manage_users.repository.UserExternalRefRepository
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.EmailService
import com.example.manage_users.service.interf.MigrationService
import io.swagger.v3.oas.annotations.servers.Servers
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class MigrationServiceImpl (
    private val userRepository: UsersRepository,
    private val userExternalRefRepository: UserExternalRefRepository,
    private val userMapper: UserMapper,
    private val passwordEncoder: PasswordEncoder,
    private val restTemplate: RestTemplate,
    private val emailService: EmailService,       // ← injection EmailService
    private val jwtProvider: JwtProvider          // ← pour générer le token
) : MigrationService {

    private val logger = LoggerFactory.getLogger(MigrationServiceImpl::class.java)

    @Value("\${agriculture.api.base-url}")
    private lateinit var agricultureBaseUrl: String

    @Value("\${agriculture.api.token}")
    private lateinit var agricultureToken: String

    // ─────────────────────────────────────────────────────────────
    // MIGRATION EN MASSE
    // ─────────────────────────────────────────────────────────────
    @Transactional
    override fun migrerTousLesUsers(): MigrationReport {
        logger.info("🚀 Début de la migration en masse")

        val usersAgricoles = recupererUsersDepuisAgriculture()
        logger.info("📦 ${usersAgricoles.size} users récupérés depuis Agriculture")

        var created = 0
        var skipped = 0
        var errors  = 0
        val details = mutableListOf<String>()

        for (agriUser in usersAgricoles) {
            try {
                when (migrerUnUser(agriUser)) {
                    MigrationResultat.CREE   -> created++
                    MigrationResultat.IGNORE -> skipped++
                }
            } catch (e: Exception) {
                errors++
                val msg = "❌ ${agriUser.userCode} : ${e.message}"
                logger.error(msg)
                details.add(msg)
            }
        }

        logger.info("✅ Terminé — Créés: $created | Ignorés: $skipped | Erreurs: $errors")

        return MigrationReport(
            total   = usersAgricoles.size,
            created = created,
            skipped = skipped,
            errors  = errors,
            details = details
        )
    }

    // ─────────────────────────────────────────────────────────────
    // MIGRATION D'UN SEUL USER
    // (appelée aussi automatiquement à la connexion)
    // ─────────────────────────────────────────────────────────────
    @Transactional
    override fun migrerUnUser(agriUser: AgriUserDto): MigrationResultat {

        // 1. Déjà migré ? → rien à faire
        if (userExternalRefRepository.existsByExternalId(agriUser.userCode)) {
            logger.info("⏭️  ${agriUser.userCode} déjà migré")
            return MigrationResultat.IGNORE
        }

        val email = agriUser.userEmail
        if (email.isNullOrBlank()) {
            throw IllegalArgumentException("Email vide pour ${agriUser.userCode}")
        }

        // 2. Email déjà dans la table users ?
        //    (l'utilisateur s'est peut-être inscrit manuellement)
        // Fix 2 : findByEmail retourne Optional<Users>, on utilise .orElse(null)
        val userExistant: Users? = userRepository.findByEmail(email).orElse(null)
        val chatUserId: String

        if (userExistant != null) {
            // On lie son compte Chat existant → pas de doublon
            logger.info("🔗 Email '$email' déjà présent, liaison sans création")
            chatUserId = userExistant.id
        } else {
            // 3. Créer le user dans la table users du Chat
            val motDePasseTemp = "Temp@${agriUser.userCode.takeLast(6)}"
            val encoded = passwordEncoder.encode(motDePasseTemp)

            // 4. Créer le user dans le Chat
            val nouveauUser = userMapper.toUser(agriUser, encoded)
            val saved = userRepository.save(nouveauUser)
            chatUserId = saved.id

            logger.info("✅ User créé : ${saved.email} (id=$chatUserId)")

            // 5. Générer le token "set-password"
            //    C'est le même token que pour le reset de mot de passe
            val setPasswordToken = jwtProvider.createPasswordResetToken(
                saved.id,
                saved.email
            )

            // 6. Envoyer l'email d'invitation à créer son mot de passe
            //    → appel à ta fonction existante sendSetPasswordInvitation
            emailService.sendSetPasswordInvitation(saved, setPasswordToken)
            logger.info("📧 Email d'invitation envoyé à : ${saved.email}")
        }

        // 7. Enregistrer le pont dans user_external_refs
        userExternalRefRepository.save(
            UserExternalRef(
                chatUserId = chatUserId,
                externalId = agriUser.userCode,
                source = "AGRICULTURE"
            )
        )

        return MigrationResultat.CREE
    }

    // ─────────────────────────────────────────────────────────────
    // Appel HTTP → API Agriculture
    // ─────────────────────────────────────────────────────────────
    private fun recupererUsersDepuisAgriculture(): List<AgriUserDto> {
        val headers = HttpHeaders().apply {
            set("Authorization", "Bearer $agricultureToken")
            contentType = MediaType.APPLICATION_JSON
        }

        // ❌ AVANT : on attendait List<AgriUserDto> directement
        // ✅ APRÈS : on attend AgriApiResponse qui contient le champ "data"
        val response = restTemplate.exchange(
            "$agricultureBaseUrl/api/users/getAllUserByUserType?userType=RESPONSABLE", // POS_AGENT, RESPONSABLE, TRANSPORTEUR, SUPER_ADMIN, ADMIN, ANY, RMS_AGENT, ALL, CONTROLLER
            HttpMethod.GET,
            HttpEntity<Void>(headers),
            AgriApiResponse::class.java          // ← on désérialise l'enveloppe
        )

        val body = response.body
            ?: throw RuntimeException("Réponse vide depuis l'API Agriculture")

        if (body.status != "SUCCESS") {
            throw RuntimeException("API Agriculture en erreur : ${body.message}")
        }

        logger.info("📦 ${body.data.size} users récupérés (code=${body.code})")

        return body.data   // ← on retourne uniquement la liste
    }
}
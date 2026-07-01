package com.example.manage_users.service.impl

import com.example.manage_users.dto.EmbedVerifyRequest
import com.example.manage_users.dto.EmbedVerifyResponse
import com.example.manage_users.repository.UserExternalRefRepository
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.EmbedAuthService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class EmbedAuthServiceImpl(
    private val jwtProvider: JwtProvider,
    private val userExternalRefRepository: UserExternalRefRepository,
    private val usersRepository: UsersRepository,
    private val restTemplate: RestTemplate,

    @Value("\${agriculture.api.base-url}")
    private val agricultureBaseUrl: String,

    @Value("\${agriculture.api.token}")
    private val agricultureAdminToken: String
) : EmbedAuthService {

    private val log = LoggerFactory.getLogger(EmbedAuthServiceImpl::class.java)

    /**
     * Vérifie un token Agriculture et retourne un JWT Chat si valide.
     *
     * Étapes :
     *  1. Vérifier que le token Agriculture est structurellement valide
     *     en appelant GET /api/users/check côté Agriculture.
     *  2. Vérifier que l'email du token correspond à l'email reçu.
     *  3. Retrouver le chatUserId via UserExternalRef (uid Agriculture → id Chat).
     *  4. Générer un JWT Chat interne et le retourner.
     */
    override fun verifyAndGenerateChatToken(request: EmbedVerifyRequest): EmbedVerifyResponse {

        log.info("🔐 Embed verify — uid=${request.uid}, email=${request.email}")

        // ── Étape 1 : Appel à l'API Agriculture pour valider le token ────────
        val agriUserValid = checkTokenWithAgriApi(request.token, request.email)
        if (!agriUserValid) {
            log.warn("❌ Token Agriculture invalide pour uid=${request.uid}")
            return EmbedVerifyResponse(
                valid = false,
                message = "Token Agriculture invalide ou expiré"
            )
        }

        // ── Étape 2 : Retrouver le user Chat via UserExternalRef ─────────────
        // uid reçu = externalId dans user_external_refs (ex: "RESP-00123")
        val externalRef = userExternalRefRepository.findByExternalId(request.uid)

        if (externalRef == null) {
            log.warn("⚠️  Aucun UserExternalRef trouvé pour uid=${request.uid}")
            // L'user n'a pas encore été migré → on essaie via l'email directement
            val chatUser = usersRepository.findByEmail(request.email).orElse(null)
                ?: return EmbedVerifyResponse(
                    valid = false,
                    message = "Utilisateur non trouvé dans le système Chat. Veuillez contacter l'administrateur."
                )

            log.info("✅ User trouvé via email : ${chatUser.email}")
            val chatToken = jwtProvider.generateTokenWithClaims(
                userId = chatUser.id,
                email  = chatUser.email,
                role   = chatUser.role?.name ?: "USER"
            )
            return EmbedVerifyResponse(
                valid       = true,
                chatToken   = chatToken,
                chatUserId  = chatUser.id,
                email       = chatUser.email
            )
        }

        // ── Étape 3 : Charger le user Chat via chatUserId ────────────────────
        val chatUser = usersRepository.findById(externalRef.chatUserId).orElse(null)
            ?: return EmbedVerifyResponse(
                valid = false,
                message = "Utilisateur Chat introuvable (ref orpheline)"
            )

        // ── Étape 4 : Générer le JWT Chat interne ────────────────────────────
        val chatToken = jwtProvider.generateTokenWithClaims(
            userId = chatUser.id,
            email  = chatUser.email,
            role   = chatUser.role?.name ?: "USER"
        )

        log.info("✅ Chat token généré pour ${chatUser.email}")

        return EmbedVerifyResponse(
            valid      = true,
            chatToken  = chatToken,
            chatUserId = chatUser.id,
            email      = chatUser.email
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vérifie le token en appelant GET /api/users/check côté Agriculture
    // L'endpoint retourne les infos du user si le token est valide
    // ─────────────────────────────────────────────────────────────────────────
    private fun checkTokenWithAgriApi(token: String, email: String): Boolean {
        return try {
            val headers = HttpHeaders().apply {
                // On passe le token Agriculture de l'utilisateur (pas le token admin)
                set("Authorization", "Bearer $token")
                contentType = MediaType.APPLICATION_JSON
            }

            val response = restTemplate.exchange(
                "$agricultureBaseUrl/api/users/check",
                HttpMethod.GET,
                HttpEntity<Void>(headers),
                Map::class.java
            )

            if (!response.statusCode.is2xxSuccessful) {
                log.warn("⚠️  Agriculture /check retourné ${response.statusCode}")
                return false
            }

            // Vérification supplémentaire : l'email correspond-il ?
            val body = response.body
            val returnedEmail = body?.get("email")?.toString()
                ?: body?.get("data")?.let { (it as? Map<*, *>)?.get("email")?.toString() }

            if (returnedEmail != null && returnedEmail != email) {
                log.warn("⚠️  Email mismatch: reçu=$email, Agriculture=$returnedEmail")
                return false
            }

            true

        } catch (e: Exception) {
            log.error("❌ Erreur appel Agriculture /check : ${e.message}")
            false
        }
    }
}
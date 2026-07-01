package com.example.manage_users.controller

import com.example.manage_users.dto.SocialAuthRequest
import com.example.manage_users.service.interf.SocialAuthService
import jakarta.servlet.http.HttpSession
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SocialAuthController
 *
 *  Expose un seul endpoint POST /api/auth/social qui gère les 3 providers.
 *  Le frontend envoie toujours la même structure { idToken, provider }.
 *
 *  Pense à ouvrir cet endpoint dans SecurityConfig :
 *    .requestMatchers("/api/auth/social").permitAll()
 * ─────────────────────────────────────────────────────────────────────────────
 */
@RestController
@RequestMapping("/api/auth")
class SocialAuthController(
    private val socialAuthService: SocialAuthService
) {

    private val log = LoggerFactory.getLogger(SocialAuthController::class.java)

    /**
     * Authentification via un provider social (Google, GitHub, Facebook).
     *
     * Flow :
     *   1. Frontend reçoit un idToken Firebase après le popup OAuth
     *   2. Frontend envoie cet idToken ici
     *   3. On valide avec Firebase Admin SDK
     *   4. On retourne notre JWT applicatif
     *
     * POST /api/auth/social
     * Body : { "idToken": "eyJhbGci...", "provider": "google" }
     *
     * Réponses :
     *   200 → authentification réussie
     *   400 → idToken manquant ou mal formé
     *   401 → token Firebase invalide / expiré
     *   403 → compte bloqué, suspendu, etc.
     *   500 → erreur serveur inattendue
     */
    @PostMapping("/social")
    fun socialLogin(
        @RequestBody request: SocialAuthRequest,
        httpSession: HttpSession
    ): ResponseEntity<Any> {

        // Validation minimale avant d'appeler Firebase (évite un appel réseau inutile)
        if (request.idToken.isBlank()) {
            return ResponseEntity.badRequest().body(
                errorBody("L'idToken Firebase est requis")
            )
        }

        return try {
            val result = socialAuthService.authenticateWithSocial(request.idToken)
            
            // ── Synchroniser avec la session (pour cohérence avec AuthController) ──
            val user = result.data.user
            httpSession.setAttribute("userId", user.id)
            httpSession.setAttribute("email", user.email)
            httpSession.setAttribute("role", user.role)
            httpSession.setAttribute("loginTime", System.currentTimeMillis())
            httpSession.maxInactiveInterval = 30 * 60 // 30 min

            ResponseEntity.ok()
                .header("X-Session-Id", httpSession.id)
                .body(result)

        } catch (e: IllegalArgumentException) {
            // Token invalide, expiré, email manquant, etc.
            log.warn("Authentification sociale refusée [${request.provider}]: ${e.message}")
            ResponseEntity.status(401).body(errorBody(e.message ?: "Token invalide"))

        } catch (e: IllegalStateException) {
            // Compte bloqué / suspendu / supprimé
            log.warn("Compte bloqué lors d'une connexion sociale [${request.provider}]: ${e.message}")
            ResponseEntity.status(403).body(errorBody(e.message ?: "Compte non autorisé"))

        } catch (e: Exception) {
            // Erreur inattendue (BDD indisponible, Firebase down, etc.)
            log.error("Erreur inattendue lors du login social [${request.provider}]", e)
            ResponseEntity.status(500).body(errorBody("Erreur lors de l'authentification. Réessaie."))
        }
    }

    // ── Helper pour construire un corps d'erreur cohérent ──────────────────
    private fun errorBody(message: String) = mapOf(
        "success" to false,
        "message" to message
    )
}

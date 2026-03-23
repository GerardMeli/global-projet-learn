package com.example.manage_users.controller

import com.example.manage_users.dto.EmbedVerifyRequest
import com.example.manage_users.dto.EmbedVerifyResponse
import com.example.manage_users.service.interf.EmbedAuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/embed")
@Tag(name = "Embed Auth", description = "Authentification déléguée pour l'intégration iframe")
class EmbedAuthController(
    private val embedAuthService: EmbedAuthService
) {

    /**
     * POST /api/embed/verify
     *
     * Reçoit les paramètres passés dans l'URL de l'iframe (uid, email, token),
     * vérifie le token Agriculture, et retourne un JWT Chat si valide.
     *
     * ⚠️  Cet endpoint DOIT être déclaré public dans SecurityConfig
     *     (l'iframe n'a pas encore de JWT Chat au moment de l'appel).
     */
    @PostMapping("/verify")
    @Operation(
        summary = "Vérifie un token Agriculture et retourne un JWT Chat",
        description = """
            Appelé par le frontend Chat au démarrage de l'iframe.
            Reçoit uid, email et token Agriculture.
            Retourne un chatToken (JWT interne) si tout est valide.
        """
    )
    fun verifyEmbedToken(
        @RequestBody request: EmbedVerifyRequest
    ): ResponseEntity<EmbedVerifyResponse> {

        val response = embedAuthService.verifyAndGenerateChatToken(request)

        return if (response.valid) {
            ResponseEntity.ok(response)
        } else {
            // 401 si token invalide / user introuvable
            ResponseEntity.status(401).body(response)
        }
    }
}
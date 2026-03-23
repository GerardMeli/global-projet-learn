package com.example.manage_users.controller

import com.example.manage_users.service.interf.AuthService
import com.example.manage_users.service.interf.TokenService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam

@Controller
@RequestMapping("/api/auth")
@Tag(name = "Emails & Validation", description = "Endpoints pour la validation d'email et l'affichage des formulaires")
class EmailController(
    private val authService: AuthService,
    private val tokenService: TokenService
) {

    @Operation(summary = "Vérifier l'email", description = "Valide le token de vérification envoyé par email.")
    @GetMapping("/verify-email")
    fun verifyEmail(@Valid @RequestParam token: String): String {
        authService.verifyEmail(token)
        return "email/welcome"
    }

    @Operation(summary = "Page de réinitialisation de mot de passe", description = "Affiche le formulaire HTML pour définir un nouveau mot de passe.")
    @GetMapping("/reset-password")
    fun showResetPasswordPage(@RequestParam token: String, model: Model): String {
        return try {
            // Valide seulement le token pour vérifier qu’il n’est pas expiré
            val userId = tokenService.validatePasswordResetToken(token)

            // Ajoute le token dans le modèle pour le formulaire
            model.addAttribute("token", token)
            "reset-password-form" // Ton template Thymeleaf
        } catch (ex: Exception) {
            model.addAttribute("error", "Token invalide ou expiré")
            "error-page" // Template d’erreur
        }
    }

}

package com.example.manage_users.controller

import com.example.manage_users.service.interf.AuthService
import com.example.manage_users.service.interf.TokenService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam

@Controller
@RequestMapping("/api/auth")
class EmailController(
    private val authService: AuthService,
    private val tokenService: TokenService
) {

    @GetMapping("/verify-email")
    fun verifyEmail(@Valid @RequestParam token: String): String {
        authService.verifyEmail(token)
        return "email/welcome"
    }

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
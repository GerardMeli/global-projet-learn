package com.example.manage_users.dto

import jakarta.validation.constraints.*

class AuthDto {

    // ─────────────────────────────────────────────────────────────────────────────
//  Auth DTOs
// ─────────────────────────────────────────────────────────────────────────────

// ── Requêtes ──────────────────────────────────────────────────────────────────

    data class LoginRequest(
        @field:Email(message = "Email invalide")
        @field:NotBlank(message = "L'email est obligatoire")
        val email: String,

        @field:NotBlank(message = "Le mot de passe est obligatoire")
        val password: String
    )

    data class RefreshTokenRequest(
        @field:NotBlank(message = "Le refresh token est obligatoire")
        val refreshToken: String
    )

    data class LogoutRequest(
        // Optionnel — mais fortement recommandé pour révoquer le refresh token
        val refreshToken: String? = null
    )

    data class ForgotPasswordRequest(
        @field:Email(message = "Email invalide")
        @field:NotBlank(message = "L'email est obligatoire")
        val email: String
    )

    data class ResetPasswordRequest(
        @field:NotBlank(message = "Le token est obligatoire")
        val token: String,

        @field:NotBlank(message = "Le nouveau mot de passe est obligatoire")
        @field:Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        val newPassword: String
    )

    data class ChangePasswordRequest(
        @field:NotBlank(message = "L'ancien mot de passe est obligatoire")
        val currentPassword: String,

        @field:NotBlank(message = "Le nouveau mot de passe est obligatoire")
        @field:Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        val newPassword: String
    )

    data class VerifyEmailRequest(
        @field:NotBlank(message = "Le token est obligatoire")
        val token: String
    )

    data class ResendVerificationRequest(
        @field:Email(message = "Email invalide")
        @field:NotBlank(message = "L'email est obligatoire")
        val email: String
    )

    // ── Initialisation du mot de passe (lien reçu par email) ─────────────────
    data class SetupPasswordRequest(
        @field:NotBlank(message = "Le token est obligatoire")
        val token: String,

        @field:NotBlank(message = "Le mot de passe est obligatoire")
        @field:Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        val newPassword: String,

        @field:NotBlank(message = "La confirmation du mot de passe est obligatoire")
        val confirmPassword: String
    )

// ── Réponses ──────────────────────────────────────────────────────────────────

    data class LoginResponse(
        val accessToken: String,
        val refreshToken: String,
        val tokenType: String = "Bearer",
        val expiresIn: Long,          // secondes
        val user: AuthUserInfo
    )

    data class AuthUserInfo(
        val id: String,
        val email: String,
        val firstName: String?,
        val lastName: String?,
        val role: String,
        val permission: String,
        val emailVerified: Boolean,
        val status: String
    )

    data class MessageResponse(
        val message: String,
        val success: Boolean = true
    )

    data class TokenRefreshResponse(
        val accessToken: String,
        val refreshToken: String,
        val tokenType: String = "Bearer",
        val expiresIn: Long
    )
}
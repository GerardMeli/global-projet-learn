package com.example.manage_users.dto

import com.example.manage_users.models.Language
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

class RegistrationDto {

    data class RegisterRequest(
        @field:Email
        @field:NotBlank
        val email: String,

        @field:NotBlank
        @field:Size(min = 6, max = 50)
        val password: String,

        @field:Size(max = 100)
        val firstName: String? = null,

        @field:Size(max = 100)
        val lastName: String? = null,

        @field:Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$")
        val phoneNumber: String? = null,

        @field:Size(max = 45)
        val address: String? = null,

        val language: Language = Language.FR
    )

    data class RegisterResponse(
        val id: Long,
        val email: String,
        val firstName: String?,
        val lastName: String?,
        val role: UserRole,
        val status: UserStatus,
        val message: String = "Registration successful. Please verify your email."
    )

    // Login
    data class LoginRequest(
        @field:NotBlank
        @field:Email
        val email: String,

        @field:NotBlank
        val password: String
    )

    data class LoginResponse(
        val id: Long,
        val email: String,
        val firstName: String?,
        val lastName: String?,
        val role: UserRole,
        val accessToken: String,
        val refreshToken: String,
        val tokenType: String = "Bearer",
        val expiresIn: Long
    )

    data class RefreshTokenRequest(
        @field:NotBlank
        val refreshToken: String
    )

    data class TokenResponse(
        val accessToken: String,
        val refreshToken: String,
        val tokenType: String = "Bearer",
        val expiresIn: Long
    )

}
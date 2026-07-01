package com.reli237.web_application_chat.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

class UserDto {

    // Response DTOs
    data class UserResponse(
        val id: String,
        val email: String,
        val role: UserRole,
        val isActive: Boolean,
        val createdAt: LocalDateTime
    )

    data class UserSimpleResponse(
        val id: String,
        val email: String
    )

    data class ApiResponse<T>(
        val success: Boolean,
        val message: String,
        val data: T?,
        val timestamp: Long = System.currentTimeMillis()
    )

    data class UserProfileResponse(
        val id: String,
        val email: String,
        val firstName: String?,
        val lastName: String?,
        val phoneNumber: String?,
        val address: String?,
        val role: UserRole,
        val status: UserStatus,
        val isActive: Boolean,
        val emailVerified: Boolean,
        val language: Language,
        val theme: Theme,
        val emailNotifications: Boolean,
        val createdAt: LocalDateTime,
        val failedLoginAttempts: Int
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
        val user: UserResponse,
        val token: String,
        val tokenType: String,
        val expiresIn: String,
        val sessionId: String
    )

    // Password Reset
    data class ForgotPasswordRequest(
        @field:NotBlank
        @field:Email
        val email: String
    )

    data class ResetPasswordRequest(
        @field:NotBlank
        val token: String,

        @field:NotBlank
        @field:Size(min = 8, max = 100)
        @field:Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$"
        )
        val newPassword: String,

        @field:NotBlank
        val confirmPassword: String
    )

}

enum class UserStatus {
    PENDING_VERIFICATION,
    ACTIVE,
    INACTIVE,
    SUSPENDED,
    BLOCKED,
    DELETED,
    PENDING
}

enum class Language {
    FR,  // Français
    EN,  // Anglais
    ES,  // Espagnol
    DE,  // Allemand
    IT   // Italien
}

enum class Theme {
    LIGHT,
    DARK,
    SYSTEM
}

enum class UserRole {
    USER,
    ADMIN,
    SUPPORT
}
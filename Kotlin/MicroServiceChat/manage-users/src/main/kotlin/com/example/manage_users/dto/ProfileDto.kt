package com.example.manage_users.dto

import com.example.manage_users.models.*
import jakarta.validation.constraints.*
import java.time.LocalDateTime

class ProfileDto {

    data class UserProfileResponse(
        val id: Long,
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

    data class UserProfileUpdateRequest(
        @field:Size(max = 100)
        val firstName: String? = null,

        @field:Size(max = 100)
        val lastName: String? = null,

        @field:Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$")
        val phoneNumber: String? = null,

        @field:Size(max = 45)
        val address: String? = null
    )

    data class UserPreferencesUpdateRequest(
        val language: Language? = null,
        val theme: Theme? = null,
        val emailNotifications: Boolean? = null
    )

    data class PasswordChangeRequest(
        @field:NotBlank
        val currentPassword: String,

        @field:NotBlank
        @field:Size(min = 8, max = 100)
        @field:Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
            message = "Password must contain at least one digit, one lowercase, one uppercase, one special character and no spaces"
        )
        val newPassword: String,

        @field:NotBlank
        val confirmPassword: String
    )

    data class EmailUpdateRequest(
        @field:NotBlank
        @field:Email
        val newEmail: String,

        @field:NotBlank
        @field:Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$"
        )
        val password: String
    )

}
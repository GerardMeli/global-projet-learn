package com.example.manage_users.dto

import com.example.manage_users.models.Language
import com.example.manage_users.models.Theme
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

class AdminDto {

    data class AdminUserResponse(
        val email: String,
        val firstName: String?,
        val lastName: String?,
        val role: UserRole,
        val status: UserStatus,
        val isActive: Boolean,
        val emailVerified: Boolean,
        val failedLoginAttempts: Int,
        val createdAt: LocalDateTime,
        val lastLoginAt: LocalDateTime?,
        val phoneNumber: String?,
        val address: String?,
        val language: Language,
        val theme: Theme
    )

    data class AdminUserUpdateRequest(
        val firstName: String? = null,
        val lastName: String? = null,
        @Pattern(
            regexp = "^\\+237\\s6\\d{2}\\s\\d{3}\\s\\d{3}$",
            message = "Invalid Cameroonian phone number format. Example: +237 698 520 147"
        )
        val phoneNumber: String? = null,
        val address: String? = null,
        val role: UserRole? = null,
        val status: UserStatus? = null,
        val isActive: Boolean? = null,
        val emailVerified: Boolean? = null,
        val failedLoginAttempts: Int? = null,
        val language: Language? = null,
        val theme: Theme? = null,
        val emailNotifications: Boolean? = null
    )

    data class UserStatusUpdateRequest(
        @field:NotNull
        val status: UserStatus,

        @field:Size(max = 500)
        val reason: String? = null
    )

    data class UserRoleUpdateRequest(
        @field:NotNull
        val role: UserRole,

        @field:Size(max = 500)
        val reason: String? = null
    )

    data class CreateUserRequest(
        @field:NotBlank
        val firstName: String,

        @field:NotBlank
        val lastName: String,

        @field:jakarta.validation.constraints.Email
        @field:NotBlank
        val email: String,

        @field:NotBlank
        @field:Size(min = 6, max = 100)
        val password: String? = null,

        val role: UserRole = UserRole.USER,

        @Pattern(
            regexp = "^\\+237\\s6\\d{2}\\s\\d{3}\\s\\d{3}$",
            message = "Invalid Cameroonian phone number format. Example: +237 698 520 147"
        )
        val phoneNumber: String? = null,

        @field:Size(max = 45)
        val address: String? = null,

        val isActive: Boolean = true,
    )

    data class CreateUserResponse(
        val id:        String,
        val firstName: String?,
        val lastName:  String?,
        val email:     String,
        val role:      UserRole,
        val status:    UserStatus,
        val isActive:  Boolean,
        val createdAt: LocalDateTime,
    )

}
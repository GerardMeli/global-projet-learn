package com.example.manage_users.dto

import com.example.manage_users.models.Language
import com.example.manage_users.models.Theme
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

class AdminDto {

    data class AdminUserResponse(
        val id: Long,
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

    data class UserSearchCriteria(
        val email: String? = null,
        val firstName: String? = null,
        val lastName: String? = null,
        val role: UserRole? = null
    )

    data class PaginatedUsersResponse(
        val content: List<AdminUserResponse>,
        val page: Int,
        val size: Int,
        val totalElements: Long,
        val totalPages: Int,
        val last: Boolean
    )

}
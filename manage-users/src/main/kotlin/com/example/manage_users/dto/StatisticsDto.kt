package com.example.manage_users.dto

import com.example.manage_users.models.Language
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import java.time.LocalDateTime

class StatisticsDto {

    // Statistics
    data class UserStatisticsResponse(
        val totalUsers: Long,
        val activeUsers: Long,
        val pendingVerification: Long,
        val suspendedUsers: Long,
        val blockedUsers: Long,
        val deletedUsers: Long,
        val usersByRole: Map<UserRole, Long>,
        val usersByLanguage: Map<Language, Long>,
        val newUsersLast7Days: Long,
        val newUsersLast30Days: Long
    )

    data class UserActivityResponse(
        val userId: Long,
        val email: String,
        val lastLoginAt: LocalDateTime?,
        val failedLoginAttempts: Int,
        val status: UserStatus,
        val isActive: Boolean
    )

}
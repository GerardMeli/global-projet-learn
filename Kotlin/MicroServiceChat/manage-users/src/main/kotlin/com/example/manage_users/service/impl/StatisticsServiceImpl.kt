package com.example.manage_users.service.impl

import com.example.manage_users.dto.StatisticsDto
import com.example.manage_users.models.Language
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.service.interf.StatisticsService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class StatisticsServiceImpl(
    private val usersRepository: UsersRepository
) : StatisticsService {

    override fun getUserStatistics(): StatisticsDto.UserStatisticsResponse {
        val now = LocalDateTime.now()
        val sevenDaysAgo = now.minusDays(7)
        val thirtyDaysAgo = now.minusDays(30)

        val totalUsers = usersRepository.count()

        return StatisticsDto.UserStatisticsResponse(
            totalUsers = totalUsers,
            activeUsers = usersRepository.countByStatus(UserStatus.ACTIVE),
            pendingVerification = usersRepository.countByStatus(UserStatus.PENDING),
            suspendedUsers = usersRepository.countByStatus(UserStatus.SUSPENDED),
            blockedUsers = usersRepository.countByStatus(UserStatus.BLOCKED),
            deletedUsers = usersRepository.countByStatus(UserStatus.DELETED),
            usersByRole = getUserCountsByRole(),
            usersByLanguage = getUserCountsByLanguage(),
            newUsersLast7Days = usersRepository.findByCreatedAtBetween(sevenDaysAgo, now).size.toLong(),
            newUsersLast30Days = usersRepository.findByCreatedAtBetween(thirtyDaysAgo, now).size.toLong()
        )
    }

    fun getUserActivity(pageable: Pageable): Page<StatisticsDto.UserActivityResponse> {
        val users = usersRepository.findAll(pageable)
        val content = users.content.map { user ->
            StatisticsDto.UserActivityResponse(
                userId = user.id,
                email = user.email,
                lastLoginAt = null, // No lastLoginAt field available
                failedLoginAttempts = user.failedLoginAttempts,
                status = user.status,
                isActive = user.isActive
            )
        }

        return PageImpl(content, pageable, users.totalElements)
    }

    private fun getUserCountsByRole(): Map<UserRole, Long> {
        return UserRole.values().associateWith { role ->
            try {
                usersRepository.countByRole(role)
            } catch (e: Exception) {
                0L
            }
        }
    }

    private fun getUserCountsByLanguage(): Map<Language, Long> {
        return Language.values().associateWith { language ->
            try {
                // Use the existing findByLanguage method or count manually
                usersRepository.findByLanguage(language).size.toLong()
            } catch (e: Exception) {
                // If findByLanguage doesn't exist, fallback to filtering in memory
                usersRepository.findAll().count { it.language == language }.toLong()
            }
        }
    }

}
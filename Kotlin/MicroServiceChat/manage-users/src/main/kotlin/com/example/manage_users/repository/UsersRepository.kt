package com.example.manage_users.repository

import com.example.manage_users.models.Language
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import com.example.manage_users.models.Users
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime
import java.util.Optional

interface UsersRepository : JpaRepository<Users, Long> {

    fun findByLanguage(language: Language): List<Users>

    fun findByEmail(email: String): Optional<Users>

    fun existsByEmail(email: String): Boolean

    fun findByEmailAndIsActiveTrue(email: String): Optional<Users>

    fun findByStatus(status: UserStatus): List<Users>

    fun findByRole(role: UserRole): List<Users>

    fun findByIsActive(isActive: Boolean): List<Users>

    fun findByEmailVerified(emailVerified: Boolean): List<Users>

    fun findByCreatedAtBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<Users>

    fun findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
        firstName: String,
        lastName: String
    ): List<Users>

    @Query("SELECT u FROM Users u WHERE " +
            "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:firstName IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :firstName, '%'))) AND " +
            "(:lastName IS NULL OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))) AND " +
            "(:role IS NULL OR u.role = :role) ")
    fun searchUsers(
        @Param("email") email: String?,
        @Param("firstName") firstName: String?,
        @Param("lastName") lastName: String?,
        @Param("role") role: UserRole?,
        pageable: Pageable
    ): Page<Users>

    @Modifying
    @Query("UPDATE Users u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.id = :userId")
    fun incrementFailedLoginAttempts(@Param("userId") userId: Long)

    @Modifying
    @Query("UPDATE Users u SET u.failedLoginAttempts = 0 WHERE u.id = :userId")
    fun resetFailedLoginAttempts(@Param("userId") userId: Long)

    @Modifying
    @Query("UPDATE Users u SET u.status = :status WHERE u.id = :userId")
    fun updateStatus(@Param("userId") userId: Long, @Param("status") status: UserStatus)

    @Modifying
    @Query("UPDATE Users u SET u.isActive = :isActive WHERE u.id = :userId")
    fun updateActiveStatus(@Param("userId") userId: Long, @Param("isActive") isActive: Boolean)

    @Modifying
    @Query("UPDATE Users u SET u.emailVerified = :emailVerified WHERE u.id = :userId")
    fun updateEmailVerified(@Param("userId") userId: Long, @Param("emailVerified") emailVerified: Boolean)

    @Query("SELECT COUNT(u) FROM Users u WHERE u.status = :status")
    fun countByStatus(@Param("status") status: UserStatus): Long

    @Query("SELECT COUNT(u) FROM Users u WHERE u.role = :role")
    fun countByRole(@Param("role") role: UserRole): Long

    @Query("SELECT COUNT(u) FROM Users u WHERE u.language = :language")
    fun countByLanguage(@Param("language") language: String): Long

    @Query("SELECT u FROM Users u WHERE u.emailVerified = false AND u.createdAt < :thresholdDate")
    fun findUnverifiedUsersOlderThan(@Param("thresholdDate") thresholdDate: LocalDateTime): List<Users>
}
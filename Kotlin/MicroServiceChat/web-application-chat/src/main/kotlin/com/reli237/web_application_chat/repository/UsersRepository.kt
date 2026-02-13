package com.reli237.web_application_chat.repository

import com.reli237.web_application_chat.model.UserRole
import com.reli237.web_application_chat.model.Users
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.Optional

@Repository
interface UsersRepository: JpaRepository<Users, Long> {

    fun findByEmail(email: String?): Optional<Users>

    fun existsByEmail(email: String): Boolean

    fun findByIsActiveTrue(): List<Users>

    fun findByRole(role: UserRole): List<Users>

    fun findByCreatedAtBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<Users>

    // Récupérer tous les utilisateurs sauf celui spécifié
    @Query("SELECT u FROM Users u WHERE u.id != :currentUserId AND u.isActive = true ORDER BY u.email")
    fun findAllExceptCurrentUser(@Param("currentUserId") currentUserId: Long): List<Users>

    // Récupérer les utilisateurs par recherche (pour la barre de recherche)
    @Query("SELECT u FROM Users u WHERE u.id != :currentUserId AND u.isActive = true AND LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY u.email")
    fun searchUsersExceptCurrentUser(
        @Param("currentUserId") currentUserId: Long,
        @Param("query") query: String
    ): List<Users>
}
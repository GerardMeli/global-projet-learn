package com.example.manage_users.repository

import com.example.manage_users.models.Users
import com.example.manage_users.utils.UserRole
import com.example.manage_users.utils.UserStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

// ─────────────────────────────────────────────────────────────────────────────
//  Repository de base — partagé par tous les services
//  Toutes les requêtes filtrent systématiquement par `role` pour isoler
//  les données de chaque profil métier.
// ─────────────────────────────────────────────────────────────────────────────

@Repository
interface UsersRepository : JpaRepository<Users, String> {


    fun findByEmail(email: String): Optional<Users>
    fun existsByEmail(email: String): Boolean
    fun findAllByRole(role: UserRole): List<Users>

    fun findByIdAndRole(id: String, role: UserRole): Optional<Users>
    fun existsByIdAndRole(id: String, role: UserRole): Boolean

    fun findAllByRoleAndStatus(role: UserRole, status: UserStatus): List<Users>
    fun findAllByRoleAndIsActive(role: UserRole, isActive: Boolean): List<Users>

    @Query("""
        SELECT u FROM Users u
        WHERE u.role = :role
          AND (
            LOWER(u.email)     LIKE LOWER(CONCAT('%', :query, '%')) OR
            LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR
            LOWER(u.lastName)  LIKE LOWER(CONCAT('%', :query, '%'))
          )
    """)
    fun searchByRoleAndQuery(
        @Param("role") role: UserRole,
        @Param("query") query: String
    ): List<Users>

    @Modifying
    @Query("UPDATE Users u SET u.failedLoginAttempts = 0 WHERE u.id = :id")
    fun resetFailedLoginAttempts(@Param("id") id: String)

    @Modifying
    @Query("UPDATE Users u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.id = :id")
    fun incrementFailedLoginAttempts(@Param("id") id: String)

    @Modifying
    @Query("UPDATE Users u SET u.emailVerified = true, u.status = 'ACTIVE' WHERE u.id = :id")
    fun verifyEmail(@Param("id") id: String)

    @Modifying
    @Query("DELETE FROM Users u WHERE u.id = :id AND u.role = :role")
    fun deleteByIdAndRole(@Param("id") id: String, @Param("role") role: UserRole): Int

    fun countByRole(role: UserRole): Long
    fun countByRoleAndStatus(role: UserRole, status: UserStatus): Long

}
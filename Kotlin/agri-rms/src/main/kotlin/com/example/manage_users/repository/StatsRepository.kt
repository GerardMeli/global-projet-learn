package com.example.manage_users.repository

import com.example.manage_users.models.Users
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

// ─────────────────────────────────────────────────────────────────────────────
//  StatsRepository
//  Repository dédié aux requêtes de statistiques pour ne pas surcharger
//  UsersRepository. Porte sur la même entité Users.
// ─────────────────────────────────────────────────────────────────────────────

@Repository
interface StatsRepository: JpaRepository<Users, String> {

    // ── Comptage par rôle ─────────────────────────────────────────────────────

    @Query("SELECT u.role, COUNT(u) FROM Users u GROUP BY u.role")
    fun countAllByRole(): List<Array<Any>>

    @Query("SELECT u.role, COUNT(u) FROM Users u WHERE u.isActive = true GROUP BY u.role")
    fun countActiveByRole(): List<Array<Any>>

    @Query("SELECT u.role, COUNT(u) FROM Users u WHERE u.isActive = false GROUP BY u.role")
    fun countInactiveByRole(): List<Array<Any>>

    // ── Comptage par statut ───────────────────────────────────────────────────

    @Query("SELECT u.status, COUNT(u) FROM Users u GROUP BY u.status")
    fun countAllByStatus(): List<Array<Any>>

    // ── Évolution des inscriptions par mois ───────────────────────────────────
    //
    //  FUNCTION('TO_CHAR', ...) est la syntaxe JPQL portable pour appeler
    //  des fonctions SQL natives. Fonctionne avec PostgreSQL (TO_CHAR).
    //  Retourne des lignes [label: String, count: Long].

    @Query("""
        SELECT FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM') as period,
               COUNT(u) as total
        FROM Users u
        WHERE u.createdAt >= :since
        GROUP BY FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM')
        ORDER BY period ASC
    """)
    fun countRegistrationsByMonth(
        @Param("since") since: LocalDateTime
    ): List<Array<Any>>

    // ── Évolution des inscriptions par semaine ISO ─────────────────────────────
    //
    //  IYYY = année ISO (basée sur la semaine), IW = numéro de semaine ISO (01–53).
    //  Exemple de label produit : "2025-W04"

    @Query("""
        SELECT FUNCTION('TO_CHAR', u.createdAt, 'IYYY-"W"IW') as period,
               COUNT(u) as total
        FROM Users u
        WHERE u.createdAt >= :since
        GROUP BY FUNCTION('TO_CHAR', u.createdAt, 'IYYY-"W"IW')
        ORDER BY period ASC
    """)
    fun countRegistrationsByWeek(
        @Param("since") since: LocalDateTime
    ): List<Array<Any>>

    // ── Totaux actifs / inactifs ──────────────────────────────────────────────

    fun countByIsActive(isActive: Boolean): Long

}
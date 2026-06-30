package com.example.manage_users.dto

class StatsDto {

    // ─────────────────────────────────────────────────────────────────────────────
//  Stats DTOs
// ─────────────────────────────────────────────────────────────────────────────

    data class GlobalStatsResponse(
        val totalUsers: Long,
        val activeUsers: Long,
        val inactiveUsers: Long,
        val byRole: List<RoleStatDto>,
        val byStatus: List<StatusStatDto>,
        val registrationsByMonth: List<PeriodStatDto>,  // 12 derniers mois
        val registrationsByWeek: List<PeriodStatDto>    // 4 dernières semaines
    )

    data class RoleStatDto(
        val role: String,
        val total: Long,
        val active: Long,
        val inactive: Long
    )

    data class StatusStatDto(
        val status: String,
        val count: Long,
        val percentage: Double
    )

    data class PeriodStatDto(
        val label: String,   // "2025-01" pour les mois, "2025-W04" pour les semaines
        val count: Long
    )

}
package com.example.manage_users.service.impl

import com.example.manage_users.dto.StatsDto
import com.example.manage_users.utils.UserRole
import com.example.manage_users.repository.StatsRepository
import com.example.manage_users.service.interf.StatsServiceInterface
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.temporal.IsoFields

// ─────────────────────────────────────────────────────────────────────────────
//  StatsServiceImpl
//  Toutes les requêtes sont en lecture seule (@Transactional readOnly).
//  Les séries temporelles sont toujours complètes (mois/semaines sans
//  inscription = count 0) pour éviter des trous dans les graphiques.
// ─────────────────────────────────────────────────────────────────────────────

@Service
@Transactional(readOnly = true)
class StatsServiceImpl (
    private val statsRepository: StatsRepository
) : StatsServiceInterface {

    override fun getGlobalStats(): StatsDto.GlobalStatsResponse {

        // ── Totaux globaux ────────────────────────────────────────────────────
        val totalUsers    = statsRepository.count()
        val activeUsers   = statsRepository.countByIsActive(true)
        val inactiveUsers = statsRepository.countByIsActive(false)

        // ── Stats par rôle ────────────────────────────────────────────────────
        // On exécute 3 requêtes groupées et on les fusionne par rôle
        // pour éviter N+1 requêtes (une par rôle).
        val totalByRole    = statsRepository.countAllByRole()
            .associate { row -> row[0].toString() to (row[1] as Long) }
        val activeByRole   = statsRepository.countActiveByRole()
            .associate { row -> row[0].toString() to (row[1] as Long) }
        val inactiveByRole = statsRepository.countInactiveByRole()
            .associate { row -> row[0].toString() to (row[1] as Long) }

        val byRole = UserRole.entries.map { role ->
            StatsDto.RoleStatDto(
                role = role.name,
                total = totalByRole[role.name] ?: 0L,
                active = activeByRole[role.name] ?: 0L,
                inactive = inactiveByRole[role.name] ?: 0L
            )
        }

        // ── Stats par statut ──────────────────────────────────────────────────
        val statusCounts = statsRepository.countAllByStatus()
            .associate { row -> row[0].toString() to (row[1] as Long) }

        val byStatus = statusCounts
            .map { (status, count) ->
                StatsDto.StatusStatDto(
                    status = status,
                    count = count,
                    percentage = if (totalUsers > 0)
                        ((count.toDouble() / totalUsers) * 100).roundTo(1)
                    else 0.0
                )
            }
            .sortedByDescending { it.count }

        // ── Évolution des inscriptions ─────────────────────────────────────────
        val twelveMonthsAgo = LocalDateTime.now()
            .minusMonths(11)
            .withDayOfMonth(1)
            .withHour(0).withMinute(0).withSecond(0).withNano(0)

        val fourWeeksAgo = LocalDateTime.now()
            .minusWeeks(3)
            .withHour(0).withMinute(0).withSecond(0).withNano(0)

        val rawMonths = statsRepository.countRegistrationsByMonth(twelveMonthsAgo)
            .associate { row -> row[0].toString() to (row[1] as Long) }

        val rawWeeks = statsRepository.countRegistrationsByWeek(fourWeeksAgo)
            .associate { row -> row[0].toString() to (row[1] as Long) }

        val registrationsByMonth = buildMonthSeries(rawMonths, 12)
        val registrationsByWeek  = buildWeekSeries(rawWeeks, 4)

        return StatsDto.GlobalStatsResponse(
            totalUsers = totalUsers,
            activeUsers = activeUsers,
            inactiveUsers = inactiveUsers,
            byRole = byRole,
            byStatus = byStatus,
            registrationsByMonth = registrationsByMonth,
            registrationsByWeek = registrationsByWeek
        )
    }

    // ── Helpers séries temporelles ────────────────────────────────────────────

    /**
     * Génère une série de [count] mois consécutifs jusqu'à aujourd'hui,
     * en remplissant les mois sans données par count = 0.
     * Exemple pour count=3 en mars 2026 : ["2026-01", "2026-02", "2026-03"]
     */
    private fun buildMonthSeries(
        data: Map<String, Long>,
        count: Int
    ): List<StatsDto.PeriodStatDto> {
        val now = LocalDateTime.now()
        return (count - 1 downTo 0).map { monthsBack ->
            val date  = now.minusMonths(monthsBack.toLong())
            val label = "%04d-%02d".format(date.year, date.monthValue)
            StatsDto.PeriodStatDto(label = label, count = data[label] ?: 0L)
        }
    }

    /**
     * Génère une série de [count] semaines ISO consécutives jusqu'à aujourd'hui,
     * en remplissant les semaines sans données par count = 0.
     * Exemple pour count=4 : ["2026-W06", "2026-W07", "2026-W08", "2026-W09"]
     */
    private fun buildWeekSeries(
        data: Map<String, Long>,
        count: Int
    ): List<StatsDto.PeriodStatDto> {
        val now = LocalDateTime.now()
        return (count - 1 downTo 0).map { weeksBack ->
            val date     = now.minusWeeks(weeksBack.toLong())
            val isoWeek  = date.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR)
            val isoYear  = date.get(IsoFields.WEEK_BASED_YEAR)
            val label    = "%04d-W%02d".format(isoYear, isoWeek)
            StatsDto.PeriodStatDto(label = label, count = data[label] ?: 0L)
        }
    }

    private fun Double.roundTo(decimals: Int): Double {
        var multiplier = 1.0
        repeat(decimals) { multiplier *= 10 }
        return kotlin.math.round(this * multiplier) / multiplier
    }
}

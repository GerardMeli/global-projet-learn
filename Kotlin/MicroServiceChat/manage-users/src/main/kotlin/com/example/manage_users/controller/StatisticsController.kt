package com.example.manage_users.controller

import com.example.manage_users.dto.StatisticsDto
import com.example.manage_users.service.impl.StatisticsServiceImpl
import com.example.manage_users.service.interf.StatisticsService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/statistics")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Statistiques", description = "Endpoints pour l'analyse et les statistiques des utilisateurs")
class StatisticsController (
    private val statisticsService: StatisticsService,
    private val statisticsServiceImpl: StatisticsServiceImpl
) {

    @Operation(summary = "Résumé des statistiques", description = "Fournit un aperçu global des utilisateurs (nombre total, actifs, etc.).")
    @GetMapping("/summary")
    fun getUserStatistics(): ResponseEntity<StatisticsDto.UserStatisticsResponse> {
        val response = statisticsService.getUserStatistics()
        return ResponseEntity.ok(response)
    }

    // Dans le contrôleur
    @Operation(summary = "Activité des utilisateurs", description = "Récupère les données d'activité récentes des utilisateurs.")
    @GetMapping("/activity")
    fun getUserActivity(): ResponseEntity<List<StatisticsDto.UserActivityResponse>> {
        val response = statisticsServiceImpl.getUserActivity()
        return ResponseEntity.ok(response)
    }
}

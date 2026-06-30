package com.example.manage_users.controller

import com.example.manage_users.dto.StatsDto
import com.example.manage_users.service.interf.StatsServiceInterface
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

// ─────────────────────────────────────────────────────────────────────────────
//  StatsController
//  Base URL : /api/stats
//  Accès    : SUPER_ADMIN + D_GENERALE
//
//  GET /api/stats  →  dashboard complet
// ─────────────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/stats")
@PreAuthorize("('SUPER_ADMIN', 'D_GENERALE')")
class StatsController (
    private val statsService: StatsServiceInterface
) {

    @GetMapping
    fun getGlobalStats(): ResponseEntity<StatsDto.GlobalStatsResponse> =
        ResponseEntity.ok(statsService.getGlobalStats())
}
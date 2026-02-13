package com.example.manage_users.controller

import com.example.manage_users.dto.StatisticsDto
import com.example.manage_users.service.impl.StatisticsServiceImpl
import com.example.manage_users.service.interf.StatisticsService
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
class StatisticsController (
    private val statisticsService: StatisticsService,
    private val statisticsServiceImpl: StatisticsServiceImpl
) {

    @GetMapping("/summary")
    fun getUserStatistics(): ResponseEntity<StatisticsDto.UserStatisticsResponse> {
        val response = statisticsService.getUserStatistics()
        return ResponseEntity.ok(response)
    }

    @GetMapping("/activity")
    fun getUserActivity(
        @PageableDefault(size = 20, sort = ["id"], direction = Sort.Direction.DESC) pageable: Pageable
    ): ResponseEntity<Page<StatisticsDto.UserActivityResponse>> {
        val response = statisticsServiceImpl.getUserActivity(pageable)
        return ResponseEntity.ok(response)
    }
}
package com.example.manage_users.controller

import com.example.manage_users.dto.PageDto
import com.example.manage_users.dto.PlotDto
import com.example.manage_users.service.interf.PlotService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/plots")
@Tag(name = "Plot", description = "Plot management endpoints")
class PlotController(
    private val plotService: PlotService
) {

    @PreAuthorize("hasRole('D_PLANTATION')")
    @PostMapping("/plot")
    @Operation(summary = "Create a new plot")
    fun createPlot(
        @Valid @RequestBody request: PlotDto.PlotCreateRequest
    ): ResponseEntity<PlotDto.PlotResponse> {
        val response = plotService.createPlot(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get plot by ID")
    fun getPlotById(
        @PathVariable id: String
    ): ResponseEntity<PlotDto.PlotResponse> {
        val response = plotService.getPlotById(id)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}/detail")
    @Operation(summary = "Get plot details with recent activities")
    fun getPlotDetailById(
        @PathVariable id: String
    ): ResponseEntity<PlotDto.PlotDetailResponse> {
        val response = plotService.getPlotDetailById(id)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('D_PLANTATION')")
    @Operation(summary = "Update an existing plot")
    fun updatePlot(
        @PathVariable id: String,
        @Valid @RequestBody request: PlotDto.PlotUpdateRequest
    ): ResponseEntity<PlotDto.PlotResponse> {
        val response = plotService.updatePlot(id, request)
        return ResponseEntity.ok(response)
    }

    @PreAuthorize("hasRole('D_PLANTATION')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a plot")
    fun deletePlot(
        @PathVariable id: String
    ): ResponseEntity<Void> {
        plotService.deletePlot(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping
    @Operation(summary = "Get all plots with pagination")
    fun getAllPlots(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<PlotDto.PlotResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = plotService.getAllPlots(pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/farm/{farmId}")
    @Operation(summary = "Get plots by farm ID")
    fun getPlotsByFarmId(
        @PathVariable farmId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<PlotDto.PlotResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = plotService.getPlotsByFarmId(farmId, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/farm/{farmId}/summary")
    @Operation(summary = "Get plots summary by farm ID")
    fun getPlotsByFarmIdSummary(
        @PathVariable farmId: String
    ): ResponseEntity<List<PlotDto.PlotSummaryResponse>> {
        val response = plotService.getPlotsByFarmIdSummary(farmId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/manager/{managerId}")
    @Operation(summary = "Get plots by manager ID")
    fun getPlotsByManagerId(
        @PathVariable managerId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<PlotDto.PlotResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = plotService.getPlotsByManagerId(managerId, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/culture/{culture}")
    @Operation(summary = "Get plots by culture type")
    fun getPlotsByCulture(
        @PathVariable culture: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<PlotDto.PlotResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = plotService.getPlotsByCulture(culture, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/inactive")
    @Operation(summary = "Get plots without recent activity")
    fun getPlotsWithoutRecentActivity(
        @RequestParam(defaultValue = "30") days: Int
    ): ResponseEntity<List<PlotDto.PlotSummaryResponse>> {
        val response = plotService.getPlotsWithoutRecentActivity(days)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get plot statistics")
    fun getPlotStatistics(
        @RequestParam(required = false) farmId: String?
    ): ResponseEntity<Map<String, Any>> {
        val response = plotService.getPlotStatistics(farmId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/farm/{farmId}/total-surface")
    @Operation(summary = "Get total surface by farm ID")
    fun getTotalSurfaceByFarmId(
        @PathVariable farmId: String
    ): ResponseEntity<Map<String, Float?>> {
        val totalSurface = plotService.getTotalSurfaceByFarmId(farmId)
        return ResponseEntity.ok(mapOf("totalSurface" to totalSurface))
    }

    private fun createPageRequest(page: Int, size: Int, sort: String): PageRequest {
        val sortOrders = sort.split(",").let {
            if (it.size == 2) {
                Sort.by(if (it[1].equals("desc", ignoreCase = true))
                    Sort.Direction.DESC else Sort.Direction.ASC, it[0])
            } else {
                Sort.by(Sort.Direction.ASC, "name")
            }
        }
        return PageRequest.of(page, size, sortOrders)
    }
}
package com.example.manage_users.service.interf

import com.example.manage_users.dto.PageDto
import com.example.manage_users.dto.PlotDto
import org.springframework.data.domain.Pageable
import java.time.LocalDateTime
import java.util.UUID

interface PlotService {

    fun createPlot(request: PlotDto.PlotCreateRequest): PlotDto.PlotResponse

    fun updatePlot(id: String, request: PlotDto.PlotUpdateRequest): PlotDto.PlotResponse

    fun getPlotById(id: String): PlotDto.PlotResponse

    fun getPlotDetailById(id: String): PlotDto.PlotDetailResponse

    fun deletePlot(id: String)

    fun getAllPlots(pageable: Pageable): PageDto.PageResponse<PlotDto.PlotResponse>

    fun getPlotsByFarmId(farmId: String, pageable: Pageable): PageDto.PageResponse<PlotDto.PlotResponse>

    fun getPlotsByManagerId(managerId: String, pageable: Pageable): PageDto.PageResponse<PlotDto.PlotResponse>

    fun getPlotsByCulture(culture: String, pageable: Pageable): PageDto.PageResponse<PlotDto.PlotResponse>

    fun getPlotsWithoutRecentActivity(days: Int): List<PlotDto.PlotSummaryResponse>

    fun getPlotsByFarmIdSummary(farmId: String): List<PlotDto.PlotSummaryResponse>

    fun updatePlotLastActivity(plotId: String, activityDate: LocalDateTime)

    fun getTotalSurfaceByFarmId(farmId: String): Float?

    fun getPlotStatistics(farmId: String? = null): Map<String, Any>
}
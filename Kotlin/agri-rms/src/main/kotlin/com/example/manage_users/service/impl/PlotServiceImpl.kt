package com.example.manage_users.service.impl

import com.example.manage_users.dto.PageDto
import com.example.manage_users.dto.PlotDto
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.execption.ValidationException
import com.example.manage_users.models.Plot
import com.example.manage_users.repository.FarmRepository
import com.example.manage_users.repository.PlotRepository
import com.example.manage_users.service.interf.PlotService
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional
class PlotServiceImpl (
    private val plotRepository: PlotRepository,
    private val farmRepository: FarmRepository
) : PlotService {

    override fun createPlot(request: PlotDto.PlotCreateRequest): PlotDto.PlotResponse {
        // Vérifier que la ferme existe
        val farm = farmRepository.findById(request.farmId)
            .orElseThrow { ResourceNotFoundException("Farm not found with id: ${request.farmId}") }

        // Vérifier le nom unique dans la ferme
        val existingPlots = plotRepository.findByFarmId(request.farmId)
        if (existingPlots.any { it.name.equals(request.name, ignoreCase = true) }) {
            throw ValidationException("A plot with name '${request.name}' already exists in this farm")
        }

        val plot = Plot(
            name = request.name,
            farm = farm,
            culture = request.culture,
            surface = request.surface,
            geoJson = request.geoJson
        )

        val savedPlot = plotRepository.save(plot)
        return PlotDto.PlotResponse.fromEntity(savedPlot)
    }

    override fun updatePlot(id: String, request: PlotDto.PlotUpdateRequest): PlotDto.PlotResponse {
        val plot = getPlotEntity(id)

        request.name?.let { newName ->
            // Vérifier l'unicité du nom dans la ferme
            val existingPlots = plotRepository.findByFarmId(plot.farm.id)
            if (existingPlots.any { it.name.equals(newName, ignoreCase = true) && it.id != id }) {
                throw ValidationException("A plot with name '$newName' already exists in this farm")
            }
            plot.name = newName
        }

        request.culture?.let { plot.culture = it }
        request.surface?.let {
            if (it <= 0) throw ValidationException("Surface must be positive")
            plot.surface = it
        }
        request.geoJson?.let { plot.geoJson = it }

        val updatedPlot = plotRepository.save(plot)
        return PlotDto.PlotResponse.fromEntity(updatedPlot)
    }

    override fun getPlotById(id: String): PlotDto.PlotResponse {
        return PlotDto.PlotResponse.fromEntity(getPlotEntity(id))
    }

    override fun getPlotDetailById(id: String): PlotDto.PlotDetailResponse {
        val plot = getPlotEntity(id)

        val activities = plot.activities
            .sortedByDescending { it.date }
            .take(10)
            .map { activity ->
                PlotDto.PlotActivityInfo(
                    id = activity.id,
                    type = activity.type.toString(),
                    date = activity.date,
                    status = activity.status.toString(),
                    operatorId = activity.operatorId
                )
            }

        return PlotDto.PlotDetailResponse.fromEntity(plot, activities)
    }

    override fun deletePlot(id: String) {
        val plot = getPlotEntity(id)

        // Vérifier s'il y a des activités associées
        if (plot.activities.isNotEmpty()) {
            throw ValidationException("Cannot delete plot with existing activities. Archive it instead.")
        }

        plotRepository.delete(plot)
    }

    override fun getAllPlots(pageable: Pageable): PageDto.PageResponse<PlotDto.PlotResponse> {
        val page = plotRepository.findAll(pageable)
        return PageDto.PageResponse.fromPage(page) { PlotDto.PlotResponse.fromEntity(it) }
    }

    override fun getPlotsByFarmId(farmId: String, pageable: Pageable): PageDto.PageResponse<PlotDto.PlotResponse> {
        val plots = plotRepository.findByFarmId(farmId)
        return convertToPageResponse(plots.map { PlotDto.PlotResponse.fromEntity(it) }, pageable)
    }

    override fun getPlotsByManagerId(managerId: String, pageable: Pageable): PageDto.PageResponse<PlotDto.PlotResponse> {
        val plots = plotRepository.findByManagerId(managerId)
        return convertToPageResponse(plots.map { PlotDto.PlotResponse.fromEntity(it) }, pageable)
    }

    override fun getPlotsByCulture(culture: String, pageable: Pageable): PageDto.PageResponse<PlotDto.PlotResponse> {
        // Implémentation à adapter selon les besoins
        val plots = plotRepository.findAll().filter { it.culture == culture }
        return convertToPageResponse(plots.map { PlotDto.PlotResponse.fromEntity(it) }, pageable)
    }

    override fun getPlotsWithoutRecentActivity(days: Int): List<PlotDto.PlotSummaryResponse> {
        val date = LocalDateTime.now().minusDays(days.toLong())
        return plotRepository.findPlotsWithoutRecentActivity(date)
            .map { plot ->
                PlotDto.PlotSummaryResponse(
                    id = plot.id,
                    name = plot.name,
                    culture = plot.culture,
                    surface = plot.surface,
                    lastActivity = plot.lastActivity
                )
            }
    }

    override fun getPlotsByFarmIdSummary(farmId: String): List<PlotDto.PlotSummaryResponse> {
        return plotRepository.findByFarmId(farmId)
            .map { plot ->
                PlotDto.PlotSummaryResponse(
                    id = plot.id,
                    name = plot.name,
                    culture = plot.culture,
                    surface = plot.surface,
                    lastActivity = plot.lastActivity
                )
            }
    }

    override fun updatePlotLastActivity(plotId: String, activityDate: LocalDateTime) {
        plotRepository.updateLastActivity(plotId, activityDate)
    }

    override fun getTotalSurfaceByFarmId(farmId: String): Float? {
        return plotRepository.sumSurfaceByFarmId(farmId)
    }

    override fun getPlotStatistics(farmId: String?): Map<String, Any> {
        val plots = if (farmId != null) {
            plotRepository.findByFarmId(farmId)
        } else {
            plotRepository.findAll()
        }

        val totalPlots = plots.size
        val totalSurface = plots.sumOf { it.surface?.toDouble() ?: 0.0 }.toFloat()
        val cultures = plots.groupBy { it.culture ?: "Non spécifié" }
            .mapValues { it.value.size }
            .toList()
            .sortedByDescending { it.second }
            .take(5)
            .toMap()

        val activePlots = plots.count { it.lastActivity != null && it.lastActivity!!.isAfter(LocalDateTime.now().minusMonths(1)) }

        return mapOf(
            "totalPlots" to totalPlots,
            "totalSurface" to totalSurface,
            "averageSurface" to if (totalPlots > 0) totalSurface / totalPlots else 0f,
            "topCultures" to cultures,
            "activePlots" to activePlots,
            "inactivePlots" to (totalPlots - activePlots)
        )
    }

    private fun getPlotEntity(id: String): Plot {
        return plotRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Plot not found with id: $id") }
    }

    private fun <T> convertToPageResponse(list: List<T>, pageable: Pageable): PageDto.PageResponse<T> {
        val start = pageable.pageNumber * pageable.pageSize
        val end = minOf(start + pageable.pageSize, list.size)
        val pageContent = if (start < list.size) list.subList(start, end) else emptyList()

        return PageDto.PageResponse(
            content = pageContent,
            pageNumber = pageable.pageNumber,
            pageSize = pageable.pageSize,
            totalElements = list.size.toLong(),
            totalPages = (list.size + pageable.pageSize - 1) / pageable.pageSize,
            isFirst = pageable.pageNumber == 0,
            isLast = end >= list.size,
            hasNext = end < list.size,
            hasPrevious = pageable.pageNumber > 0
        )
    }
}
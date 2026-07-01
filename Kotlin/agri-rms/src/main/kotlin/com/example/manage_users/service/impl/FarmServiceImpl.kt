package com.example.manage_users.service.impl

import com.example.manage_users.dto.FarmDto
import com.example.manage_users.dto.PageDto
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.execption.ValidationException
import com.example.manage_users.models.Farm
import com.example.manage_users.repository.FarmRepository
import com.example.manage_users.repository.PlotRepository
import com.example.manage_users.service.interf.FarmService
import com.example.manage_users.utils.FarmStatus
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
class FarmServiceImpl(
    private val farmRepository: FarmRepository,
    private val plotRepository: PlotRepository
) : FarmService {

    override fun createFarm(request: FarmDto.FarmCreateRequest): FarmDto.FarmResponse {
        // Vérifier les doublons de nom
        val existingFarms = farmRepository.findByNameContaining(request.name)
        if (existingFarms.any { it.name.equals(request.name, ignoreCase = true) }) {
            throw ValidationException("Farm with name '${request.name}' already exists")
        }

        val farm = Farm(
            name = request.name,
            location = request.location,
            city = request.city,
            surfaceTotal = request.surfaceTotal,
            cultureType = request.cultureType,
            status = request.status,
            managerId = request.managerId
        )

        val savedFarm = farmRepository.save(farm)
        return FarmDto.FarmResponse.fromEntity(savedFarm)
    }

    override fun updateFarm(id: String, request: FarmDto.FarmUpdateRequest): FarmDto.FarmResponse {
        val farm = getFarmEntity(id)

        request.name?.let {
            // Vérifier l'unicité du nom
            val existingFarms = farmRepository.findByNameContaining(it)
            if (existingFarms.any { farm -> farm.name.equals(it, ignoreCase = true) && farm.id != id }) {
                throw ValidationException("Farm with name '$it' already exists")
            }
            farm.name = it
        }

        request.location?.let { farm.location = it }
        request.city?.let { farm.city = it }
        request.surfaceTotal?.let {
            if (it <= 0) throw ValidationException("Surface total must be positive")
            farm.surfaceTotal = it
        }
        request.cultureType?.let { farm.cultureType = it }
        request.status?.let { farm.status = it }
        request.managerId?.let { farm.managerId = it }

        val updatedFarm = farmRepository.save(farm)
        return FarmDto.FarmResponse.fromEntity(updatedFarm)
    }

    override fun getFarmById(id: String): FarmDto.FarmResponse {
        return FarmDto.FarmResponse.fromEntity(getFarmEntity(id))
    }

    override fun getFarmDetailById(id: String): FarmDto.FarmDetailResponse {
        val farm = getFarmEntity(id)

        val plots = plotRepository.findByFarmId(id)
            .map { plot ->
                FarmDto.FarmPlotInfo(
                    id = plot.id,
                    name = plot.name,
                    culture = plot.culture,
                    surface = plot.surface,
                    lastActivity = plot.lastActivity
                )
            }

        return FarmDto.FarmDetailResponse.fromEntity(farm, plots)
    }

    override fun deleteFarm(id: String) {
        val farm = getFarmEntity(id)

        // Vérifier s'il y a des parcelles associées
        val plotsCount = plotRepository.countByFarmId(id)
        if (plotsCount > 0) {
            throw ValidationException("Cannot delete farm with existing plots. Archive it instead.")
        }

        farmRepository.delete(farm)
    }

    override fun getAllFarms(pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse> {
        val page = farmRepository.findAll(pageable)
        return PageDto.PageResponse.fromPage(page) { FarmDto.FarmResponse.fromEntity(it) }
    }

    override fun getFarmsByStatus(status: FarmStatus, pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse> {
        val farms = farmRepository.findByStatus(status)
        return convertToPageResponse(farms.map { FarmDto.FarmResponse.fromEntity(it) }, pageable)
    }

    override fun getFarmsByManagerId(managerId: String, pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse> {
        val farms = farmRepository.findByManagerId(managerId)
        return convertToPageResponse(farms.map { FarmDto.FarmResponse.fromEntity(it) }, pageable)
    }

    override fun getFarmsByCity(city: String, pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse> {
        val farms = farmRepository.findByCity(city)
        return convertToPageResponse(farms.map { FarmDto.FarmResponse.fromEntity(it) }, pageable)
    }

    override fun searchFarmsByName(name: String, pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse> {
        val farms = farmRepository.findByNameContaining(name)
        return convertToPageResponse(farms.map { FarmDto.FarmResponse.fromEntity(it) }, pageable)
    }

    override fun updateFarmStatus(id: String, request: FarmDto.FarmStatusUpdateRequest): FarmDto.FarmResponse {
        val farm = getFarmEntity(id)
        farm.status = request.status
        val updatedFarm = farmRepository.save(farm)
        return FarmDto.FarmResponse.fromEntity(updatedFarm)
    }

    override fun getFarmSummary(managerId: String?): List<FarmDto.FarmSummaryResponse> {
        val farms = if (managerId != null) {
            farmRepository.findByManagerId(managerId)
        } else {
            farmRepository.findAll()
        }

        return farms.map { farm ->
            val plotsCount = plotRepository.countByFarmId(farm.id)
            FarmDto.FarmSummaryResponse(
                id = farm.id,
                name = farm.name,
                city = farm.city,
                status = farm.status,
                plotsCount = plotsCount.toInt(),
                totalSurface = farm.surfaceTotal
            )
        }
    }

    override fun getFarmStatistics(): FarmDto.FarmStatisticsResponse {
        val allFarms = farmRepository.findAll()

        val totalFarms = allFarms.size.toLong()
        val activeFarms = allFarms.count { it.status == FarmStatus.ACTIVE }.toLong()
        val inactiveFarms = allFarms.count { it.status == FarmStatus.INACTIVE }.toLong()

        val totalPlots = allFarms.sumOf { plotRepository.countByFarmId(it.id) }
        val totalSurface = allFarms.sumOf { it.surfaceTotal?.toDouble() ?: 0.0 }.toFloat()
        val averageFarmSurface = if (totalFarms > 0) totalSurface / totalFarms else null

        val farmsByCity = farmRepository.countFarmsByCity()
            .associate { it[0] as String to it[1] as Long }

        val cultures = allFarms.groupBy { it.cultureType ?: "Non spécifié" }
        val mostCommonCulture = cultures.maxByOrNull { it.value.size }?.key

        return FarmDto.FarmStatisticsResponse(
            totalFarms = totalFarms,
            activeFarms = activeFarms,
            inactiveFarms = inactiveFarms,
            totalPlots = totalPlots,
            totalSurface = totalSurface,
            averageFarmSurface = averageFarmSurface,
            farmsByCity = farmsByCity,
            mostCommonCulture = mostCommonCulture
        )
    }

    override fun assignManager(farmId: String, managerId: String): FarmDto.FarmResponse {
        val farm = getFarmEntity(farmId)
        farm.managerId = managerId
        val updatedFarm = farmRepository.save(farm)
        return FarmDto.FarmResponse.fromEntity(updatedFarm)
    }

    override fun removeManager(farmId: String): FarmDto.FarmResponse {
        val farm = getFarmEntity(farmId)
        farm.managerId = null
        val updatedFarm = farmRepository.save(farm)
        return FarmDto.FarmResponse.fromEntity(updatedFarm)
    }

    private fun getFarmEntity(id: String): Farm {
        return farmRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Farm not found with id: $id") }
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
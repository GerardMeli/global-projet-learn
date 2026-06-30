package com.example.manage_users.service.impl

import com.example.manage_users.dto.ActivityDto
import com.example.manage_users.dto.PageDto
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.execption.ValidationException
import com.example.manage_users.models.Activity
import com.example.manage_users.models.Stock
import com.example.manage_users.repository.ActivityRepository
import com.example.manage_users.repository.PlotRepository
import com.example.manage_users.repository.StockRepository
import com.example.manage_users.service.interf.ActivityService
import com.example.manage_users.utils.ActivityStatus
import com.example.manage_users.utils.ActivityType
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional
class ActivityServiceImpl(
    private val activityRepository: ActivityRepository,
    private val plotRepository: PlotRepository,
    private val stockRepository: StockRepository
) : ActivityService {

    override fun createActivity(request: ActivityDto.ActivityCreateRequest): ActivityDto.ActivityResponse {
        // Récupérer la parcelle
        val plot = plotRepository.findById(request.plotId)
            .orElseThrow { ResourceNotFoundException("Plot not found with id: ${request.plotId}") }

        // Vérifier le stock si nécessaire
        var stock: Stock? = null
        if (request.inputId != null) {
            stock = stockRepository.findById(request.inputId)
                .orElseThrow { ResourceNotFoundException("Stock not found with id: ${request.inputId}") }

            // Vérifier la quantité disponible pour les activités qui consomment du stock
            if (request.type != ActivityType.HARVEST && request.type != ActivityType.OTHER) {
                if (request.quantity == null) {
                    throw ValidationException("Quantity is required when using input stock")
                }
                if (stock.quantity < request.quantity) {
                    throw ValidationException("Insufficient stock quantity. Available: ${stock.quantity}, Requested: ${request.quantity}")
                }
            }
        }

        // Créer l'activité
        val activity = Activity(
            plot = plot,
            type = request.type,
            input = stock,
            quantity = request.quantity,
            operatorId = request.operatorId,
            date = request.date ?: LocalDateTime.now(),
            notes = request.notes,
            status = request.status ?: ActivityStatus.PENDING
        )

        val savedActivity = activityRepository.save(activity)

        // Mettre à jour lastActivity de la parcelle
        plot.lastActivity = savedActivity.date
        plotRepository.save(plot)

        // Décrémenter le stock si nécessaire
        if (stock != null && request.quantity != null && request.type != ActivityType.HARVEST && request.type != ActivityType.OTHER) {
            stockRepository.decrementQuantity(stock.id, request.quantity)
        }

        return ActivityDto.ActivityResponse.fromEntity(savedActivity)
    }

    override fun updateActivity(id: String, request: ActivityDto.ActivityUpdateRequest): ActivityDto.ActivityResponse {
        val activity = getActivityEntity(id)

        // Vérifier si le statut permet la modification
        if (activity.status == ActivityStatus.COMPLETED || activity.status == ActivityStatus.CANCELLED) {
            throw ValidationException("Cannot update completed or cancelled activity")
        }

        request.type?.let { activity.type = it }
        request.operatorId?.let { activity.operatorId = it }
        request.date?.let { activity.date = it }
        request.notes?.let { activity.notes = it }
        request.status?.let { activity.status = it }

        // Gestion du stock
        if (request.inputId != null) {
            val stock = stockRepository.findById(request.inputId)
                .orElseThrow { ResourceNotFoundException("Stock not found with id: ${request.inputId}") }

            // Restaurer l'ancien stock si nécessaire
            if (activity.input != null && activity.quantity != null) {
                stockRepository.incrementQuantity(activity.input!!.id, activity.quantity!!)
            }

            activity.input = stock
            request.quantity?.let { activity.quantity = it }

            // Décrémenter le nouveau stock
            if (request.quantity != null) {
                stockRepository.decrementQuantity(stock.id, request.quantity)
            }
        } else {
            request.quantity?.let { activity.quantity = it }
        }

        val updatedActivity = activityRepository.save(activity)
        return ActivityDto.ActivityResponse.fromEntity(updatedActivity)
    }

    override fun getActivityById(id: String): ActivityDto.ActivityResponse {
        return ActivityDto.ActivityResponse.fromEntity(getActivityEntity(id))
    }

    override fun getActivitySummaryById(id: String): ActivityDto.ActivitySummaryResponse {
        val activity = getActivityEntity(id)
        return ActivityDto.ActivitySummaryResponse(
            id = activity.id,
            plotName = activity.plot.name,
            type = activity.type,
            date = activity.date,
            status = activity.status,
            operatorId = activity.operatorId
        )
    }

    override fun deleteActivity(id: String) {
        val activity = getActivityEntity(id)

        // Restaurer le stock si l'activité était en cours
        if (activity.status == ActivityStatus.PENDING || activity.status == ActivityStatus.IN_PROGRESS) {
            if (activity.input != null && activity.quantity != null) {
                stockRepository.incrementQuantity(activity.input!!.id, activity.quantity!!)
            }
        }

        activityRepository.delete(activity)
    }

    override fun getActivitiesByPlotId(plotId: String, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse> {
        val activities = activityRepository.findByPlotId(plotId)
        val responseList = activities.map { ActivityDto.ActivityResponse.fromEntity(it) }
        return convertToPageResponse(responseList, pageable)
    }

    override fun getActivitiesByFarmId(farmId: String, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse> {
        val activities = activityRepository.findByFarmId(farmId)
        val responseList = activities.map { ActivityDto.ActivityResponse.fromEntity(it) }
        return convertToPageResponse(responseList, pageable)
    }

    override fun getActivitiesByOperatorId(operatorId: String, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse> {
        val activities = activityRepository.findByOperatorId(operatorId)
        val responseList = activities.map { ActivityDto.ActivityResponse.fromEntity(it) }
        return convertToPageResponse(responseList, pageable)
    }

    override fun getAllActivities(pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse> {
        val page = activityRepository.findAll(pageable)
        return PageDto.PageResponse.fromPage(page) { ActivityDto.ActivityResponse.fromEntity(it) }
    }

    override fun getActivitiesByType(type: ActivityType, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse> {
        val activities = activityRepository.findByType(type)
        val responseList = activities.map { ActivityDto.ActivityResponse.fromEntity(it) }
        return convertToPageResponse(responseList, pageable)
    }

    override fun getActivitiesByStatus(status: ActivityStatus, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse> {
        // Correction de la méthode findByPlotIdAndStatus - besoin d'une méthode appropriée dans le repository
        val activities = activityRepository.findByStatus(status) // Ajoutez cette méthode dans ActivityRepository
        val responseList = activities.map { ActivityDto.ActivityResponse.fromEntity(it) }
        return convertToPageResponse(responseList, pageable)
    }

    override fun getActivitiesByDateRange(
        startDate: LocalDateTime,
        endDate: LocalDateTime,
        pageable: Pageable
    ): PageDto.PageResponse<ActivityDto.ActivityResponse> {
        val activities = activityRepository.findByDateBetween(startDate, endDate)
        val responseList = activities.map { ActivityDto.ActivityResponse.fromEntity(it) }
        return convertToPageResponse(responseList, pageable)
    }

    override fun updateActivityStatus(id: String, request: ActivityDto.ActivityStatusUpdateRequest): ActivityDto.ActivityResponse {
        val activity = getActivityEntity(id)

        // Gestion spéciale selon le nouveau statut
        when (request.status) {
            ActivityStatus.COMPLETED -> {
                activity.status = ActivityStatus.COMPLETED
                // Logique supplémentaire pour finalisation
            }
            ActivityStatus.CANCELLED -> {
                // Restaurer le stock si annulation
                if (activity.input != null && activity.quantity != null) {
                    stockRepository.incrementQuantity(activity.input!!.id, activity.quantity!!)
                }
                activity.status = ActivityStatus.CANCELLED
            }
            else -> {
                activity.status = request.status
            }
        }

        val updatedActivity = activityRepository.save(activity)
        return ActivityDto.ActivityResponse.fromEntity(updatedActivity)
    }

    override fun getPlotActivitiesTimeline(plotId: String): List<ActivityDto.ActivitySummaryResponse> {
        return activityRepository.findByPlotIdOrderByDateDesc(plotId)
            .map { activity ->
                ActivityDto.ActivitySummaryResponse(
                    id = activity.id,
                    plotName = activity.plot.name,
                    type = activity.type,
                    date = activity.date,
                    status = activity.status,
                    operatorId = activity.operatorId
                )
            }
    }

    override fun getActivityStatistics(farmId: String?): ActivityDto.ActivityStatisticsResponse {
        val activities = if (farmId != null) {
            activityRepository.findByFarmId(farmId)
        } else {
            activityRepository.findAll()
        }

        val byType = activities.groupBy { it.type }.mapValues { it.value.size.toLong() }
        val byStatus = activities.groupBy { it.status }.mapValues { it.value.size.toLong() }

        val now = LocalDateTime.now()
        val lastWeek = activities.count { it.date.isAfter(now.minusWeeks(1)) }
        val thisMonth = activities.count { it.date.isAfter(now.minusMonths(1)) }

        return ActivityDto.ActivityStatisticsResponse(
            totalActivities = activities.size.toLong(),
            byType = byType,
            byStatus = byStatus,
            pendingCount = byStatus[ActivityStatus.PENDING] ?: 0,
            completedCount = byStatus[ActivityStatus.COMPLETED] ?: 0,
            lastWeekCount = lastWeek.toLong(),
            thisMonthCount = thisMonth.toLong()
        )
    }

    override fun validateActivityStock(activityId: String): Boolean {
        val activity = getActivityEntity(activityId)

        if (activity.input != null && activity.quantity != null) {
            return activity.input!!.quantity >= activity.quantity!!
        }

        return true
    }

    override fun cancelPendingActivitiesForStock(stockId: String) {
        val pendingActivities = activityRepository.findPendingByStockId(stockId)

        pendingActivities.forEach { activity ->
            activity.status = ActivityStatus.CANCELLED
            activityRepository.save(activity)
        }
    }

    private fun getActivityEntity(id: String): Activity {
        return activityRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Activity not found with id: $id") }
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
            totalPages = if (list.isEmpty()) 0 else (list.size + pageable.pageSize - 1) / pageable.pageSize,
            isFirst = pageable.pageNumber == 0,
            isLast = end >= list.size,
            hasNext = end < list.size,
            hasPrevious = pageable.pageNumber > 0
        )
    }

}
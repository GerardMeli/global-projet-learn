package com.example.manage_users.service.interf

import com.example.manage_users.dto.ActivityDto
import com.example.manage_users.dto.PageDto
import com.example.manage_users.utils.ActivityStatus
import com.example.manage_users.utils.ActivityType
import org.springframework.data.domain.Pageable
import java.time.LocalDateTime

interface ActivityService {
    fun createActivity(request: ActivityDto.ActivityCreateRequest): ActivityDto.ActivityResponse

    fun updateActivity(id: String, request: ActivityDto.ActivityUpdateRequest): ActivityDto.ActivityResponse

    fun getActivityById(id: String): ActivityDto.ActivityResponse

    fun getActivitySummaryById(id: String): ActivityDto.ActivitySummaryResponse

    fun deleteActivity(id: String)

    fun getAllActivities(pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse>

    fun getActivitiesByPlotId(plotId: String, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse>

    fun getActivitiesByFarmId(farmId: String, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse>

    fun getActivitiesByOperatorId(operatorId: String, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse>

    fun getActivitiesByType(type: ActivityType, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse>

    fun getActivitiesByStatus(status: ActivityStatus, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse>

    fun getActivitiesByDateRange(startDate: LocalDateTime, endDate: LocalDateTime, pageable: Pageable): PageDto.PageResponse<ActivityDto.ActivityResponse>

    fun updateActivityStatus(id: String, request: ActivityDto.ActivityStatusUpdateRequest): ActivityDto.ActivityResponse

    fun getPlotActivitiesTimeline(plotId: String): List<ActivityDto.ActivitySummaryResponse>

    fun getActivityStatistics(farmId: String? = null): ActivityDto.ActivityStatisticsResponse

    fun validateActivityStock(activityId: String): Boolean

    fun cancelPendingActivitiesForStock(stockId: String)
}
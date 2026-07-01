package com.example.manage_users.dto

import com.example.manage_users.models.Activity
import com.example.manage_users.utils.ActivityStatus
import com.example.manage_users.utils.ActivityType
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.PastOrPresent
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import java.util.UUID

class ActivityDto {

    data class ActivityCreateRequest(
        @field:NotNull(message = "Plot ID is required")
        val plotId: String,

        @field:NotNull(message = "Activity type is required")
        val type: ActivityType,

        val inputId: String? = null,

        @field:Positive(message = "Quantity must be positive")
        val quantity: Float? = null,

        @field:Size(max = 38, message = "Operator ID must not exceed 38 characters")
        val operatorId: String? = null,

        @field:PastOrPresent(message = "Date cannot be in the future")
        val date: LocalDateTime? = null,

        @field:Size(max = 1000, message = "Notes must not exceed 1000 characters")
        val notes: String? = null,

        val status: ActivityStatus? = ActivityStatus.PENDING
    )

    data class ActivityUpdateRequest(
        val type: ActivityType? = null,

        val inputId: String? = null,

        @field:Positive(message = "Quantity must be positive")
        val quantity: Float? = null,

        @field:Size(max = 38, message = "Operator ID must not exceed 38 characters")
        val operatorId: String? = null,

        @field:PastOrPresent(message = "Date cannot be in the future")
        val date: LocalDateTime? = null,

        @field:Size(max = 1000, message = "Notes must not exceed 1000 characters")
        val notes: String? = null,

        val status: ActivityStatus? = null
    )

    data class ActivityStatusUpdateRequest(
        @field:NotNull(message = "Status is required")
        val status: ActivityStatus
    )

    data class ActivityResponse(
        val id: String,
        val plotId: String,
        val plotName: String,
        val type: ActivityType,
        val inputId: String?,
        val inputName: String?,
        val quantity: Float?,
        val operatorId: String?,
        val date: LocalDateTime,
        val notes: String?,
        val status: ActivityStatus,
        val createdAt: LocalDateTime,
        val updatedAt: LocalDateTime
    ) {
        companion object {
            fun fromEntity(activity: Activity): ActivityResponse {
                return ActivityResponse(
                    id = activity.id,
                    plotId = activity.plot.id,
                    plotName = activity.plot.name,
                    type = activity.type,
                    inputId = activity.input?.id,
                    inputName = activity.input?.name,
                    quantity = activity.quantity,
                    operatorId = activity.operatorId,
                    date = activity.date,
                    notes = activity.notes,
                    status = activity.status,
                    createdAt = activity.createdAt,
                    updatedAt = activity.updatedAt
                )
            }
        }
    }

    data class ActivitySummaryResponse(
        val id: String,
        val plotName: String,
        val type: ActivityType,
        val date: LocalDateTime,
        val status: ActivityStatus,
        val operatorId: String?
    )

    data class ActivityStatisticsResponse(
        val totalActivities: Long,
        val byType: Map<ActivityType, Long>,
        val byStatus: Map<ActivityStatus, Long>,
        val pendingCount: Long,
        val completedCount: Long,
        val lastWeekCount: Long,
        val thisMonthCount: Long
    )
}
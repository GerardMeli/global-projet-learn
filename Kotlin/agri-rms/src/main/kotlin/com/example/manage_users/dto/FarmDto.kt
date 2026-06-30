package com.example.manage_users.dto

import com.example.manage_users.models.Farm
import com.example.manage_users.utils.FarmStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import java.util.UUID

class FarmDto {

    data class FarmCreateRequest(
        @field:NotBlank(message = "Farm name is required")
        @field:Size(max = 150, message = "Farm name must not exceed 150 characters")
        val name: String,

        @field:Size(max = 255, message = "Location must not exceed 255 characters")
        val location: String? = null,

        @field:Size(max = 100, message = "City must not exceed 100 characters")
        val city: String? = null,

        @field:Positive(message = "Surface total must be positive")
        val surfaceTotal: Float? = null,

        @field:Size(max = 100, message = "Culture type must not exceed 100 characters")
        val cultureType: String? = null,

        val status: FarmStatus = FarmStatus.ACTIVE,

        @field:Size(max = 38, message = "Manager ID must not exceed 38 characters")
        val managerId: String? = null
    )

    data class FarmUpdateRequest(
        @field:Size(max = 150, message = "Farm name must not exceed 150 characters")
        val name: String? = null,

        @field:Size(max = 255, message = "Location must not exceed 255 characters")
        val location: String? = null,

        @field:Size(max = 100, message = "City must not exceed 100 characters")
        val city: String? = null,

        @field:Positive(message = "Surface total must be positive")
        val surfaceTotal: Float? = null,

        @field:Size(max = 100, message = "Culture type must not exceed 100 characters")
        val cultureType: String? = null,

        val status: FarmStatus? = null,

        @field:Size(max = 38, message = "Manager ID must not exceed 38 characters")
        val managerId: String? = null
    )

    data class FarmStatusUpdateRequest(
        @field:NotNull(message = "Status is required")
        val status: FarmStatus
    )

    data class FarmResponse(
        val id: String,
        val name: String,
        val location: String?,
        val city: String?,
        val surfaceTotal: Float?,
        val cultureType: String?,
        val status: FarmStatus,
        val managerId: String?,
        val createdAt: LocalDateTime,
        val updatedAt: LocalDateTime,
        val plotsCount: Int
    ) {
        companion object {
            fun fromEntity(farm: Farm): FarmResponse {
                return FarmResponse(
                    id = farm.id,
                    name = farm.name,
                    location = farm.location,
                    city = farm.city,
                    surfaceTotal = farm.surfaceTotal,
                    cultureType = farm.cultureType,
                    status = farm.status,
                    managerId = farm.managerId,
                    createdAt = farm.createdAt,
                    updatedAt = farm.updatedAt,
                    plotsCount = farm.plots.size
                )
            }
        }
    }

    data class FarmDetailResponse(
        val id: String,
        val name: String,
        val location: String?,
        val city: String?,
        val surfaceTotal: Float?,
        val cultureType: String?,
        val status: FarmStatus,
        val managerId: String?,
        val createdAt: LocalDateTime,
        val updatedAt: LocalDateTime,
        val plots: List<FarmPlotInfo>
    ) {
        companion object {
            fun fromEntity(farm: Farm, plots: List<FarmPlotInfo>): FarmDetailResponse {
                return FarmDetailResponse(
                    id = farm.id,
                    name = farm.name,
                    location = farm.location,
                    city = farm.city,
                    surfaceTotal = farm.surfaceTotal,
                    cultureType = farm.cultureType,
                    status = farm.status,
                    managerId = farm.managerId,
                    createdAt = farm.createdAt,
                    updatedAt = farm.updatedAt,
                    plots = plots
                )
            }
        }
    }

    data class FarmPlotInfo(
        val id: String,
        val name: String,
        val culture: String?,
        val surface: Float?,
        val lastActivity: LocalDateTime?
    )

    data class FarmSummaryResponse(
        val id: String,
        val name: String,
        val city: String?,
        val status: FarmStatus,
        val plotsCount: Int,
        val totalSurface: Float?
    )

    data class FarmStatisticsResponse(
        val totalFarms: Long,
        val activeFarms: Long,
        val inactiveFarms: Long,
        val totalPlots: Long,
        val totalSurface: Float?,
        val averageFarmSurface: Float?,
        val farmsByCity: Map<String, Long>,
        val mostCommonCulture: String?
    )
}
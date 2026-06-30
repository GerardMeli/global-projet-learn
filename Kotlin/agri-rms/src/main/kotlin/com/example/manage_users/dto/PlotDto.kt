package com.example.manage_users.dto

import com.example.manage_users.models.Plot
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import java.util.UUID

class PlotDto {

    data class PlotCreateRequest(
        @field:NotBlank(message = "Plot name is required")
        @field:Size(max = 150, message = "Plot name must not exceed 150 characters")
        val name: String,

        @field:NotNull(message = "Farm ID is required")
        val farmId: String,

        @field:Size(max = 100, message = "Culture must not exceed 100 characters")
        val culture: String? = null,

        @field:Positive(message = "Surface must be positive")
        val surface: Float? = null,

        val geoJson: String? = null
    )

    data class PlotUpdateRequest(
        @field:Size(max = 150, message = "Plot name must not exceed 150 characters")
        val name: String? = null,

        @field:Size(max = 100, message = "Culture must not exceed 100 characters")
        val culture: String? = null,

        @field:Positive(message = "Surface must be positive")
        val surface: Float? = null,

        val geoJson: String? = null
    )

    data class PlotResponse(
        val id: String,
        val name: String,
        val farmId: String,
        val farmName: String,
        val culture: String?,
        val surface: Float?,
        val geoJson: String?,
        val lastActivity: LocalDateTime?,
        val createdAt: LocalDateTime,
        val updatedAt: LocalDateTime,
        val activitiesCount: Int
    ) {
        companion object {
            fun fromEntity(plot: Plot): PlotResponse {
                return PlotResponse(
                    id = plot.id,
                    name = plot.name,
                    farmId = plot.farm.id,
                    farmName = plot.farm.name,
                    culture = plot.culture,
                    surface = plot.surface,
                    geoJson = plot.geoJson,
                    lastActivity = plot.lastActivity,
                    createdAt = plot.createdAt,
                    updatedAt = plot.updatedAt,
                    activitiesCount = plot.activities.size
                )
            }
        }
    }

    data class PlotDetailResponse(
        val id: String,
        val name: String,
        val farmId: String,
        val farmName: String,
        val culture: String?,
        val surface: Float?,
        val geoJson: String?,
        val lastActivity: LocalDateTime?,
        val createdAt: LocalDateTime,
        val updatedAt: LocalDateTime,
        val activities: List<PlotActivityInfo>
    ) {
        companion object {
            fun fromEntity(plot: Plot, activities: List<PlotActivityInfo>): PlotDetailResponse {
                return PlotDetailResponse(
                    id = plot.id,
                    name = plot.name,
                    farmId = plot.farm.id,
                    farmName = plot.farm.name,
                    culture = plot.culture,
                    surface = plot.surface,
                    geoJson = plot.geoJson,
                    lastActivity = plot.lastActivity,
                    createdAt = plot.createdAt,
                    updatedAt = plot.updatedAt,
                    activities = activities
                )
            }
        }
    }

    data class PlotActivityInfo(
        val id: String,
        val type: String,
        val date: LocalDateTime,
        val status: String,
        val operatorId: String?
    )

    data class PlotSummaryResponse(
        val id: String,
        val name: String,
        val culture: String?,
        val surface: Float?,
        val lastActivity: LocalDateTime?
    )
}
package com.example.manage_users.controller

import com.example.manage_users.dto.ActivityDto
import com.example.manage_users.dto.PageDto
import com.example.manage_users.service.interf.ActivityService
import com.example.manage_users.utils.ActivityStatus
import com.example.manage_users.utils.ActivityType
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime
import java.util.UUID

@RestController
@RequestMapping("/api/activities")
@Tag(name = "Activity", description = "Activity management endpoints")
class ActivityController(
    private val activityService: ActivityService
) {

    @PostMapping("/activity")
    @Operation(summary = "Create a new activity")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "201", description = "Activity created successfully"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Plot or stock not found")
        ]
    )
    @PreAuthorize("hasRole('D_PLANTATION')")
    fun createActivity(
        @Valid @RequestBody request: ActivityDto.ActivityCreateRequest
    ): ResponseEntity<ActivityDto.ActivityResponse> {
        val response = activityService.createActivity(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get activity by ID")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Activity found"),
            ApiResponse(responseCode = "404", description = "Activity not found")
        ]
    )
    fun getActivityById(
        @PathVariable id: String
    ): ResponseEntity<ActivityDto.ActivityResponse> {
        val response = activityService.getActivityById(id)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}/summary")
    @Operation(summary = "Get activity summary by ID")
    fun getActivitySummaryById(
        @PathVariable id: String
    ): ResponseEntity<ActivityDto.ActivitySummaryResponse> {
        val response = activityService.getActivitySummaryById(id)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing activity")
    @PreAuthorize("hasRole('D_PLANTATION', 'AG_TERRAIN')")
    fun updateActivity(
        @PathVariable id: String,
        @Valid @RequestBody request: ActivityDto.ActivityUpdateRequest
    ): ResponseEntity<ActivityDto.ActivityResponse> {
        val response = activityService.updateActivity(id, request)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('D_PLANTATION', 'AG_TERRAIN')")
    @Operation(summary = "Update activity status")
    fun updateActivityStatus(
        @PathVariable id: String,
        @Valid @RequestBody request: ActivityDto.ActivityStatusUpdateRequest
    ): ResponseEntity<ActivityDto.ActivityResponse> {
        val response = activityService.updateActivityStatus(id, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('D_PLANTATION')")
    @Operation(summary = "Delete an activity")
    @ApiResponse(responseCode = "204", description = "Activity deleted successfully")
    fun deleteActivity(
        @PathVariable id: String
    ): ResponseEntity<Void> {
        activityService.deleteActivity(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping
    @Operation(summary = "Get all activities with pagination")
    fun getAllActivities(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "date,desc") sort: String
    ): ResponseEntity<PageDto.PageResponse<ActivityDto.ActivityResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = activityService.getAllActivities(pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/plot/{plotId}")
    @Operation(summary = "Get activities by plot ID")
    fun getActivitiesByPlotId(
        @PathVariable plotId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "date,desc") sort: String
    ): ResponseEntity<PageDto.PageResponse<ActivityDto.ActivityResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = activityService.getActivitiesByPlotId(plotId, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/farm/{farmId}")
    @Operation(summary = "Get activities by farm ID")
    fun getActivitiesByFarmId(
        @PathVariable farmId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "date,desc") sort: String
    ): ResponseEntity<PageDto.PageResponse<ActivityDto.ActivityResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = activityService.getActivitiesByFarmId(farmId, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/operator/{operatorId}")
    @Operation(summary = "Get activities by operator ID")
    fun getActivitiesByOperatorId(
        @PathVariable operatorId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "date,desc") sort: String
    ): ResponseEntity<PageDto.PageResponse<ActivityDto.ActivityResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = activityService.getActivitiesByOperatorId(operatorId, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get activities by type")
    fun getActivitiesByType(
        @PathVariable type: ActivityType,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "date,desc") sort: String
    ): ResponseEntity<PageDto.PageResponse<ActivityDto.ActivityResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = activityService.getActivitiesByType(type, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get activities by status")
    fun getActivitiesByStatus(
        @PathVariable status: ActivityStatus,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "date,desc") sort: String
    ): ResponseEntity<PageDto.PageResponse<ActivityDto.ActivityResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = activityService.getActivitiesByStatus(status, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get activities by date range")
    fun getActivitiesByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) startDate: LocalDateTime,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) endDate: LocalDateTime,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "date,desc") sort: String
    ): ResponseEntity<PageDto.PageResponse<ActivityDto.ActivityResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = activityService.getActivitiesByDateRange(startDate, endDate, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/plot/{plotId}/timeline")
    @Operation(summary = "Get activities timeline for a plot")
    fun getPlotActivitiesTimeline(
        @PathVariable plotId: String
    ): ResponseEntity<List<ActivityDto.ActivitySummaryResponse>> {
        val response = activityService.getPlotActivitiesTimeline(plotId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get activity statistics")
    fun getActivityStatistics(
        @RequestParam(required = false) farmId: String?
    ): ResponseEntity<ActivityDto.ActivityStatisticsResponse> {
        val response = activityService.getActivityStatistics(farmId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}/validate-stock")
    @Operation(summary = "Validate if activity has sufficient stock")
    fun validateActivityStock(
        @PathVariable id: String
    ): ResponseEntity<Map<String, Boolean>> {
        val isValid = activityService.validateActivityStock(id)
        return ResponseEntity.ok(mapOf("valid" to isValid))
    }

    private fun createPageRequest(page: Int, size: Int, sort: String): PageRequest {
        val sortOrders = sort.split(",").let {
            if (it.size == 2) {
                Sort.by(if (it[1].equals("desc", ignoreCase = true))
                    Sort.Direction.DESC else Sort.Direction.ASC, it[0])
            } else {
                Sort.by(Sort.Direction.DESC, "date")
            }
        }
        return PageRequest.of(page, size, sortOrders)
    }
}
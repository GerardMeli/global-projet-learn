package com.example.manage_users.controller

import com.example.manage_users.dto.FarmDto
import com.example.manage_users.dto.PageDto
import com.example.manage_users.service.interf.FarmService
import com.example.manage_users.utils.FarmStatus
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
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/farms")
@Tag(name = "Farm", description = "Farm management endpoints")
class FarmController(
    private val farmService: FarmService
) {

    @PostMapping("/farm")
    @PreAuthorize("hasRole('D_PLANTATION')")
    @Operation(summary = "Create a new farm")
    fun createFarm(
        @Valid @RequestBody request: FarmDto.FarmCreateRequest
    ): ResponseEntity<FarmDto.FarmResponse> {
        val response = farmService.createFarm(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get farm by ID")
    fun getFarmById(
        @PathVariable id: String
    ): ResponseEntity<FarmDto.FarmResponse> {
        val response = farmService.getFarmById(id)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}/detail")
    @Operation(summary = "Get farm details with plots")
    fun getFarmDetailById(
        @PathVariable id: String
    ): ResponseEntity<FarmDto.FarmDetailResponse> {
        val response = farmService.getFarmDetailById(id)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('D_PLANTATION')")
    @Operation(summary = "Update an existing farm")
    fun updateFarm(
        @PathVariable id: String,
        @Valid @RequestBody request: FarmDto.FarmUpdateRequest
    ): ResponseEntity<FarmDto.FarmResponse> {
        val response = farmService.updateFarm(id, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('D_PLANTATION')")
    @Operation(summary = "Delete a farm")
    fun deleteFarm(
        @PathVariable id: String
    ): ResponseEntity<Void> {
        farmService.deleteFarm(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping
    @Operation(summary = "Get all farms with pagination")
    fun getAllFarms(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<FarmDto.FarmResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = farmService.getAllFarms(pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get farms by status")
    fun getFarmsByStatus(
        @PathVariable status: FarmStatus,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<FarmDto.FarmResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = farmService.getFarmsByStatus(status, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/manager/{managerId}")
    @Operation(summary = "Get farms by manager ID")
    fun getFarmsByManagerId(
        @PathVariable managerId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<FarmDto.FarmResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = farmService.getFarmsByManagerId(managerId, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/city/{city}")
    @Operation(summary = "Get farms by city")
    fun getFarmsByCity(
        @PathVariable city: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<FarmDto.FarmResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = farmService.getFarmsByCity(city, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/search")
    @Operation(summary = "Search farms by name")
    fun searchFarmsByName(
        @RequestParam name: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<FarmDto.FarmResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = farmService.searchFarmsByName(name, pageable)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('D_PLANTATION')")
    @Operation(summary = "Update farm status")
    fun updateFarmStatus(
        @PathVariable id: String,
        @Valid @RequestBody request: FarmDto.FarmStatusUpdateRequest
    ): ResponseEntity<FarmDto.FarmResponse> {
        val response = farmService.updateFarmStatus(id, request)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/summary")
    @Operation(summary = "Get farms summary for a manager")
    fun getFarmSummary(
        @RequestParam(required = false) managerId: String?
    ): ResponseEntity<List<FarmDto.FarmSummaryResponse>> {
        val response = farmService.getFarmSummary(managerId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get farm statistics")
    fun getFarmStatistics(): ResponseEntity<FarmDto.FarmStatisticsResponse> {
        val response = farmService.getFarmStatistics()
        return ResponseEntity.ok(response)
    }

    @PreAuthorize("hasRole('D_PLANTATION')")
    @PostMapping("/{id}/assign-manager")
    @Operation(summary = "Assign a manager to farm")
    fun assignManager(
        @PathVariable id: String,
        @RequestParam managerId: String
    ): ResponseEntity<FarmDto.FarmResponse> {
        val response = farmService.assignManager(id, managerId)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/{id}/remove-manager")
    @PreAuthorize("hasRole('D_PLANTATION')")
    @Operation(summary = "Remove manager from farm")
    fun removeManager(
        @PathVariable id: String
    ): ResponseEntity<FarmDto.FarmResponse> {
        val response = farmService.removeManager(id)
        return ResponseEntity.ok(response)
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
package com.example.manage_users.controller

import com.example.manage_users.dto.PageDto
import com.example.manage_users.dto.StockDto
import com.example.manage_users.service.interf.StockService
import com.example.manage_users.utils.StockType
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
@RequestMapping("/api/stocks")
@Tag(name = "Stock", description = "Stock management endpoints")
class StockController(
    private val stockService: StockService
) {

    @PreAuthorize("hasRole('RESPO_STOCK')")
    @PostMapping("/stock")
    @Operation(summary = "Create a new stock")
    fun createStock(
        @Valid @RequestBody request: StockDto.StockCreateRequest
    ): ResponseEntity<StockDto.StockResponse> {
        val response = stockService.createStock(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get stock by ID")
    fun getStockById(
        @PathVariable id: String
    ): ResponseEntity<StockDto.StockResponse> {
        val response = stockService.getStockById(id)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}/summary")
    @Operation(summary = "Get stock summary by ID")
    fun getStockSummaryById(
        @PathVariable id: String
    ): ResponseEntity<StockDto.StockSummaryResponse> {
        val response = stockService.getStockSummaryById(id)
        return ResponseEntity.ok(response)
    }

    @PreAuthorize("hasRole('RESPO_STOCK')")
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing stock")
    fun updateStock(
        @PathVariable id: String,
        @Valid @RequestBody request: StockDto.StockUpdateRequest
    ): ResponseEntity<StockDto.StockResponse> {
        val response = stockService.updateStock(id, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPO_STOCK')")
    @Operation(summary = "Delete a stock")
    fun deleteStock(
        @PathVariable id: String
    ): ResponseEntity<Void> {
        stockService.deleteStock(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping
    @Operation(summary = "Get all stocks with pagination")
    fun getAllStocks(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<StockDto.StockResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = stockService.getAllStocks(pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get stocks by type")
    fun getStocksByType(
        @PathVariable type: StockType,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<StockDto.StockResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = stockService.getStocksByType(type, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/warehouse/{warehouse}")
    @Operation(summary = "Get stocks by warehouse")
    fun getStocksByWarehouse(
        @PathVariable warehouse: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<StockDto.StockResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = stockService.getStocksByWarehouse(warehouse, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/search")
    @Operation(summary = "Search stocks by name")
    fun searchStocksByName(
        @RequestParam name: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "name,asc") sort: String
    ): ResponseEntity<PageDto.PageResponse<StockDto.StockResponse>> {
        val pageable = createPageRequest(page, size, sort)
        val response = stockService.searchStocksByName(name, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/critical")
    @Operation(summary = "Get all critical stocks")
    fun getCriticalStocks(): ResponseEntity<List<StockDto.StockAlertResponse>> {
        val response = stockService.getCriticalStocks()
        return ResponseEntity.ok(response)
    }

    @GetMapping("/out-of-stock")
    @Operation(summary = "Get all out of stock items")
    fun getOutOfStockStocks(): ResponseEntity<List<StockDto.StockSummaryResponse>> {
        val response = stockService.getOutOfStockStocks()
        return ResponseEntity.ok(response)
    }

    @PreAuthorize("hasRole('AG_COLLECTE')")
    @PatchMapping("/{id}/quantity")
    @Operation(summary = "Update stock quantity (add or remove)")
    fun updateStockQuantity(
        @PathVariable id: String,
        @Valid @RequestBody request: StockDto.StockQuantityUpdateRequest
    ): ResponseEntity<StockDto.StockResponse> {
        val response = stockService.updateStockQuantity(id, request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/{id}/add")
    @PreAuthorize("hasRole('AG_COLLECTE')")
    @Operation(summary = "Add quantity to stock")
    fun addStockQuantity(
        @PathVariable id: String,
        @RequestParam quantity: Float
    ): ResponseEntity<StockDto.StockResponse> {
        val response = stockService.addStockQuantity(id, quantity)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/{id}/remove")
    @PreAuthorize("hasRole('AG_COLLECTE')")
    @Operation(summary = "Remove quantity from stock")
    fun removeStockQuantity(
        @PathVariable id: String,
        @RequestParam quantity: Float
    ): ResponseEntity<StockDto.StockResponse> {
        val response = stockService.removeStockQuantity(id, quantity)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get stock statistics")
    fun getStockStatistics(): ResponseEntity<StockDto.StockStatisticsResponse> {
        val response = stockService.getStockStatistics()
        return ResponseEntity.ok(response)
    }

    @PreAuthorize("hasRole('AG_COLLECTE', 'RESPO_STOCK')")
    @PostMapping("/check-alerts")
    @Operation(summary = "Check and get critical stock alerts")
    fun checkAndNotifyCriticalStocks(): ResponseEntity<List<StockDto.StockAlertResponse>> {
        val response = stockService.checkAndNotifyCriticalStocks()
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
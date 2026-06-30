package com.example.manage_users.service.interf

import com.example.manage_users.dto.PageDto
import com.example.manage_users.dto.StockDto
import com.example.manage_users.utils.StockType
import org.springframework.data.domain.Pageable

interface StockService {
    fun createStock(request: StockDto.StockCreateRequest): StockDto.StockResponse

    fun updateStock(id: String, request: StockDto.StockUpdateRequest): StockDto.StockResponse

    fun getStockById(id: String): StockDto.StockResponse

    fun getStockSummaryById(id: String): StockDto.StockSummaryResponse

    fun deleteStock(id: String)

    fun getAllStocks(pageable: Pageable): PageDto.PageResponse<StockDto.StockResponse>

    fun getStocksByType(type: StockType, pageable: Pageable): PageDto.PageResponse<StockDto.StockResponse>

    fun getStocksByWarehouse(warehouse: String, pageable: Pageable): PageDto.PageResponse<StockDto.StockResponse>

    fun getCriticalStocks(): List<StockDto.StockAlertResponse>

    fun getOutOfStockStocks(): List<StockDto.StockSummaryResponse>

    fun searchStocksByName(name: String, pageable: Pageable): PageDto.PageResponse<StockDto.StockResponse>

    fun updateStockQuantity(id: String, request: StockDto.StockQuantityUpdateRequest): StockDto.StockResponse

    fun addStockQuantity(id: String, quantity: Float): StockDto.StockResponse

    fun removeStockQuantity(id: String, quantity: Float): StockDto.StockResponse

    fun getStockStatistics(): StockDto.StockStatisticsResponse

    fun checkAndNotifyCriticalStocks(): List<StockDto.StockAlertResponse>

}
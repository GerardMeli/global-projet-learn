package com.example.manage_users.service.impl

import com.example.manage_users.dto.PageDto
import com.example.manage_users.dto.StockDto
import com.example.manage_users.execption.InsufficientStockException
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.execption.ValidationException
import com.example.manage_users.models.Stock
import com.example.manage_users.repository.StockRepository
import com.example.manage_users.service.interf.ActivityService
import com.example.manage_users.service.interf.StockService
import com.example.manage_users.utils.AlertSeverity
import com.example.manage_users.utils.StockOperation
import com.example.manage_users.utils.StockType
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class StockServiceImpl(
    private val stockRepository: StockRepository,
    private val activityService: ActivityService
) : StockService {

    override fun createStock(request: StockDto.StockCreateRequest): StockDto.StockResponse {
        // Vérifier les doublons de nom
        val existingStocks = stockRepository.findByNameContaining(request.name)
        if (existingStocks.any { it.name.equals(request.name, ignoreCase = true) }) {
            throw ValidationException("Stock with name '${request.name}' already exists")
        }

        val stock = Stock(
            name = request.name,
            type = request.type,
            quantity = request.quantity,
            unit = request.unit,
            threshold = request.threshold,
            warehouse = request.warehouse
        )

        val savedStock = stockRepository.save(stock)
        return StockDto.StockResponse.fromEntity(savedStock)
    }

    override fun updateStock(id: String, request: StockDto.StockUpdateRequest): StockDto.StockResponse {
        val stock = getStockEntity(id)

        request.name?.let {
            // Vérifier l'unicité du nom
            val existingStocks = stockRepository.findByNameContaining(it)
            if (existingStocks.any { stock -> stock.name.equals(it, ignoreCase = true) && stock.id != id }) {
                throw ValidationException("Stock with name '$it' already exists")
            }
            stock.name = it
        }

        request.type?.let { stock.type = it }
        request.quantity?.let {
            if (it < 0) throw ValidationException("Quantity cannot be negative")
            stock.quantity = it
        }
        request.unit?.let { stock.unit = it }
        request.threshold?.let {
            if (it < 0) throw ValidationException("Threshold cannot be negative")
            stock.threshold = it
        }
        request.warehouse?.let { stock.warehouse = it }

        val updatedStock = stockRepository.save(stock)
        return StockDto.StockResponse.fromEntity(updatedStock)
    }

    override fun getStockById(id: String): StockDto.StockResponse {
        return StockDto.StockResponse.fromEntity(getStockEntity(id))
    }

    override fun getStockSummaryById(id: String): StockDto.StockSummaryResponse {
        val stock = getStockEntity(id)
        return StockDto.StockSummaryResponse(
            id = stock.id,
            name = stock.name,
            type = stock.type,
            quantity = stock.quantity,
            unit = stock.unit,
            warehouse = stock.warehouse
        )
    }

    override fun deleteStock(id: String) {
        val stock = getStockEntity(id)

        // Vérifier si le stock est utilisé dans des activités
        val pendingActivities = activityService.cancelPendingActivitiesForStock(id)
        // Note: Cette méthode devrait être implémentée pour vérifier

        stockRepository.delete(stock)
    }

    override fun getAllStocks(pageable: Pageable): PageDto.PageResponse<StockDto.StockResponse> {
        val page = stockRepository.findAll(pageable)
        return PageDto.PageResponse.fromPage(page) { StockDto.StockResponse.fromEntity(it) }
    }

    override fun getStocksByType(type: StockType, pageable: Pageable): PageDto.PageResponse<StockDto.StockResponse> {
        val stocks = stockRepository.findByType(type)
        return convertToPageResponse(stocks.map { StockDto.StockResponse.fromEntity(it) }, pageable)
    }

    override fun getStocksByWarehouse(warehouse: String, pageable: Pageable): PageDto.PageResponse<StockDto.StockResponse> {
        val stocks = stockRepository.findByWarehouse(warehouse)
        return convertToPageResponse(stocks.map { StockDto.StockResponse.fromEntity(it) }, pageable)
    }

    override fun getCriticalStocks(): List<StockDto.StockAlertResponse> {
        return stockRepository.findCriticalStocks()
            .map { stock ->
                val severity = when {
                    stock.quantity == 0f -> AlertSeverity.CRITICAL
                    stock.quantity <= stock.threshold * 0.5 -> AlertSeverity.CRITICAL
                    stock.quantity <= stock.threshold -> AlertSeverity.WARNING
                    else -> AlertSeverity.INFO
                }

                StockDto.StockAlertResponse(
                    stockId = stock.id,
                    stockName = stock.name,
                    currentQuantity = stock.quantity,
                    threshold = stock.threshold,
                    unit = stock.unit,
                    type = stock.type,
                    severity = severity
                )
            }
    }

    override fun getOutOfStockStocks(): List<StockDto.StockSummaryResponse> {
        return stockRepository.findOutOfStock()
            .map { stock ->
                StockDto.StockSummaryResponse(
                    id = stock.id,
                    name = stock.name,
                    type = stock.type,
                    quantity = stock.quantity,
                    unit = stock.unit,
                    warehouse = stock.warehouse
                )
            }
    }

    override fun searchStocksByName(name: String, pageable: Pageable): PageDto.PageResponse<StockDto.StockResponse> {
        val stocks = stockRepository.findByNameContaining(name)
        return convertToPageResponse(stocks.map { StockDto.StockResponse.fromEntity(it) }, pageable)
    }

    override fun updateStockQuantity(id: String, request: StockDto.StockQuantityUpdateRequest): StockDto.StockResponse {
        val stock = getStockEntity(id)

        when (request.operation) {
            StockOperation.ADD -> {
                stock.quantity += request.quantity
            }
            StockOperation.REMOVE -> {
                if (stock.quantity < request.quantity) {
                    throw InsufficientStockException(
                        "Insufficient stock. Available: ${stock.quantity}, Requested: ${request.quantity}"
                    )
                }
                stock.quantity -= request.quantity
            }
        }

        val updatedStock = stockRepository.save(stock)
        return StockDto.StockResponse.fromEntity(updatedStock)
    }

    override fun addStockQuantity(id: String, quantity: Float): StockDto.StockResponse {
        if (quantity <= 0) {
            throw ValidationException("Quantity must be positive")
        }

        val stock = getStockEntity(id)
        stock.quantity += quantity
        val updatedStock = stockRepository.save(stock)
        return StockDto.StockResponse.fromEntity(updatedStock)
    }

    override fun removeStockQuantity(id: String, quantity: Float): StockDto.StockResponse {
        if (quantity <= 0) {
            throw ValidationException("Quantity must be positive")
        }

        val stock = getStockEntity(id)
        if (stock.quantity < quantity) {
            throw InsufficientStockException(
                "Insufficient stock. Available: ${stock.quantity}, Requested: $quantity"
            )
        }

        stock.quantity -= quantity
        val updatedStock = stockRepository.save(stock)
        return StockDto.StockResponse.fromEntity(updatedStock)
    }

    override fun getStockStatistics(): StockDto.StockStatisticsResponse {
        val allStocks = stockRepository.findAll()
        val criticalStocks = stockRepository.findCriticalStocks()
        val outOfStock = stockRepository.findOutOfStock()

        val byType = allStocks.groupBy { it.type }.mapValues { it.value.size.toLong() }
        val totalQuantity = StockType.values().associateWith { type ->
            stockRepository.sumQuantityByType(type) ?: 0f
        }

        val averageQuantity = if (allStocks.isNotEmpty()) {
            allStocks.map { it.quantity }.average().toFloat()
        } else 0f

        val warehouseCounts = allStocks.groupBy { it.warehouse ?: "Non spécifié" }
        val mostUsedWarehouse = warehouseCounts.maxByOrNull { it.value.size }?.key

        return StockDto.StockStatisticsResponse(
            totalStocks = allStocks.size.toLong(),
            criticalStocks = criticalStocks.size.toLong(),
            outOfStock = outOfStock.size.toLong(),
            byType = byType,
            totalQuantity = totalQuantity,
            averageQuantity = averageQuantity,
            mostUsedWarehouse = mostUsedWarehouse
        )
    }

    override fun checkAndNotifyCriticalStocks(): List<StockDto.StockAlertResponse> {
        return getCriticalStocks()
    }

    private fun getStockEntity(id: String): Stock {
        return stockRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Stock not found with id: $id") }
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
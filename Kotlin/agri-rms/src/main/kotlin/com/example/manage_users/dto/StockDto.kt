package com.example.manage_users.dto

import com.example.manage_users.models.Stock
import com.example.manage_users.utils.AlertSeverity
import com.example.manage_users.utils.StockOperation
import com.example.manage_users.utils.StockType
import com.example.manage_users.utils.StockUnit
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.PositiveOrZero
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import java.util.UUID

class StockDto {

    data class StockCreateRequest(
        @field:NotBlank(message = "Stock name is required")
        @field:Size(max = 150, message = "Stock name must not exceed 150 characters")
        val name: String,

        @field:NotNull(message = "Stock type is required")
        val type: StockType,

        @field:PositiveOrZero(message = "Quantity must be positive or zero")
        val quantity: Float = 0f,

        @field:NotNull(message = "Stock unit is required")
        val unit: StockUnit,

        @field:Positive(message = "Threshold must be positive")
        val threshold: Float = 10f,

        @field:Size(max = 100, message = "Warehouse must not exceed 100 characters")
        val warehouse: String? = null
    )

    data class StockUpdateRequest(
        @field:Size(max = 150, message = "Stock name must not exceed 150 characters")
        val name: String? = null,

        val type: StockType? = null,

        @field:PositiveOrZero(message = "Quantity must be positive or zero")
        val quantity: Float? = null,

        val unit: StockUnit? = null,

        @field:Positive(message = "Threshold must be positive")
        val threshold: Float? = null,

        @field:Size(max = 100, message = "Warehouse must not exceed 100 characters")
        val warehouse: String? = null
    )

    data class StockQuantityUpdateRequest(
        @field:NotNull(message = "Quantity is required")
        @field:Positive(message = "Quantity must be positive")
        val quantity: Float,

        val operation: StockOperation = StockOperation.ADD
    )

    data class StockResponse(
        val id: String,
        val name: String,
        val type: StockType,
        val quantity: Float,
        val unit: StockUnit,
        val threshold: Float,
        val warehouse: String?,
        val createdAt: LocalDateTime,
        val updatedAt: LocalDateTime,
        val isCritical: Boolean,
        val isOutOfStock: Boolean
    ) {
        companion object {
            fun fromEntity(stock: Stock): StockResponse {
                return StockResponse(
                    id = stock.id,
                    name = stock.name,
                    type = stock.type,
                    quantity = stock.quantity,
                    unit = stock.unit,
                    threshold = stock.threshold,
                    warehouse = stock.warehouse,
                    createdAt = stock.createdAt,
                    updatedAt = stock.updatedAt,
                    isCritical = stock.quantity <= stock.threshold && stock.threshold > 0,
                    isOutOfStock = stock.quantity == 0f
                )
            }
        }
    }

    data class StockSummaryResponse(
        val id: String,
        val name: String,
        val type: StockType,
        val quantity: Float,
        val unit: StockUnit,
        val warehouse: String?
    )

    data class StockStatisticsResponse(
        val totalStocks: Long,
        val criticalStocks: Long,
        val outOfStock: Long,
        val byType: Map<StockType, Long>,
        val totalQuantity: Map<StockType, Float>,
        val averageQuantity: Float,
        val mostUsedWarehouse: String?
    )

    data class StockAlertResponse(
        val stockId: String,
        val stockName: String,
        val currentQuantity: Float,
        val threshold: Float,
        val unit: StockUnit,
        val type: StockType,
        val severity: AlertSeverity
    )

}
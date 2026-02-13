package com.example.demo.dto

import java.time.LocalDateTime

data class OrderDto(
    var id: Long? = null,
    var orderDate: LocalDateTime = LocalDateTime.now(),
    var status: String = "",
    var totalAmount: Double = 0.0,
    var userId: Long = 0,
    var items: List<OrderItemDto> = emptyList()
)
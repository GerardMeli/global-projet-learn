package com.example.demo.dto

import java.time.LocalDateTime

data class OrderItemDto(
    var id: Long? = null,
    var quantity: Int = 0,
    var price: Double = 0.0,
    var productId: Long = 0,
    var orderId: Long = 0
)

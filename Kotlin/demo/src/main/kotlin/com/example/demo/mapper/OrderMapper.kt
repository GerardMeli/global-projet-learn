package com.example.demo.mapper

import com.example.demo.dto.OrderDto
import com.example.demo.model.Order
import com.example.demo.model.User
import com.example.demo.mapper.OrderItemMapper

object OrderMapper {

    fun toEntity(dto: OrderDto, user: User): Order {
        return Order(
            id = dto.id ?: 0,
            user = user,
            orderDate = dto.orderDate,
            status = dto.status,
            totalAmount = dto.totalAmount,
            orderItems = mutableListOf()
        )
    }

    fun toDto(order: Order): OrderDto {
        return OrderDto(
            id = order.id,
            userId = order.user.id,
            orderDate = order.orderDate,
            status = order.status,
            totalAmount = order.totalAmount,
            items = order.orderItems.map { OrderItemMapper.toDto(it) }
        )
    }
}

package com.example.demo.mapper

import com.example.demo.dto.OrderItemDto
import com.example.demo.model.Order
import com.example.demo.model.OrderItem
import com.example.demo.model.Product
//

object OrderItemMapper {

    fun toEntity(dto: OrderItemDto, product: Product, order: Order): OrderItem {
        return OrderItem(
            id = dto.id ?: 0,
            quantity = dto.quantity,
            price = dto.price,
            product = product,
            order = order
        )
    }

    fun toDto(entity: OrderItem): OrderItemDto {
        return OrderItemDto(
            id = entity.id,
            quantity = entity.quantity,
            price = entity.price,
            productId = entity.product.id,
            orderId = entity.order.id
        )
    }
}

package com.example.demo.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import com.example.demo.model.OrderItem
import com.example.demo.model.Product
import com.example.demo.repository.OrderItemRepository
import com.example.demo.repository.OrderRepository
import com.example.demo.repository.ProductRepository
import com.example.demo.mapper.OrderItemMapper
import com.example.demo.dto.OrderItemDto

@Service
@Transactional
class OrderItemService @Autowired constructor(
    private val orderItemRepository: OrderItemRepository,
    private val productRepository: ProductRepository,
    private val orderRepository: OrderRepository
) {

    fun createOrderItem(dto: OrderItemDto): OrderItem {
        val product = productRepository.findById(dto.productId)
            .orElseThrow { NoSuchElementException("Product not found") }

        val order = orderRepository.findById(dto.orderId)
            .orElseThrow { NoSuchElementException("Order not found") }

        val item = OrderItemMapper.toEntity(dto, product, order)
        return orderItemRepository.save(item)
    }

    fun getAllOrderItems(): List<OrderItemDto> =
        orderItemRepository.findAll().map { OrderItemMapper.toDto(it) }

    fun getOrderItemById(id: Long): OrderItemDto =
        orderItemRepository.findById(id)
            .orElseThrow { NoSuchElementException("OrderItem not found") }
            .let { OrderItemMapper.toDto(it) }

    fun updateOrderItem(id: Long, dto: OrderItemDto): OrderItemDto {
        val existing = orderItemRepository.findById(id)
            .orElseThrow { NoSuchElementException("OrderItem not found") }

        val product = productRepository.findById(dto.productId)
            .orElseThrow { NoSuchElementException("Product not found") }

        val order = orderRepository.findById(dto.orderId)
            .orElseThrow { NoSuchElementException("Order not found") }

        existing.quantity = dto.quantity
        existing.price = dto.price
        existing.product = product
        existing.order = order

        return OrderItemMapper.toDto(orderItemRepository.save(existing))
    }

    fun deleteOrderItem(id: Long) {
        if (!orderItemRepository.existsById(id)) {
            throw NoSuchElementException("OrderItem not found")
        }
        orderItemRepository.deleteById(id)
    }
}
package com.example.demo.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalTime
import java.time.LocalDate

import com.example.demo.model.Order
import com.example.demo.model.OrderItem
import com.example.demo.model.User
import com.example.demo.repository.OrderRepository
import com.example.demo.repository.UserRepository
import com.example.demo.repository.ProductRepository
import com.example.demo.dto.OrderDto
import com.example.demo.mapper.OrderMapper
import java.time.LocalDateTime

@Service
@Transactional
class OrderService @Autowired constructor(
    private val orderRepository: OrderRepository,
    private val userRepository: UserRepository
) {

    fun createOrder(dto: OrderDto): OrderDto {
        val user = userRepository.findById(dto.userId)
            .orElseThrow { NoSuchElementException("User not found") }

        // Convert DTO -> Entity
        val orderEntity = OrderMapper.toEntity(dto, user)

        // Save order
        val savedOrder = orderRepository.save(orderEntity)

        // Convert Entity -> DTO
        return OrderMapper.toDto(savedOrder)
    }

    fun getAllOrders(): List<OrderDto> =
        orderRepository.findAll().map { OrderMapper.toDto(it) }

    fun getOrderById(id: Long): OrderDto =
        orderRepository.findById(id)
            .orElseThrow { NoSuchElementException("Order not found") }
            .let { OrderMapper.toDto(it) }

    fun updateOrder(id: Long, dto: OrderDto): OrderDto {
        val existing = orderRepository.findById(id)
            .orElseThrow { NoSuchElementException("Order not found") }

        val user = userRepository.findById(dto.userId)
            .orElseThrow { NoSuchElementException("User not found") }

        existing.status = dto.status
        existing.totalAmount = dto.totalAmount
        existing.user = user
        existing.orderDate = dto.orderDate

        return OrderMapper.toDto(orderRepository.save(existing))
    }

    fun deleteOrder(id: Long) {
        if (!orderRepository.existsById(id)) {
            throw NoSuchElementException("Order not found")
        }
        orderRepository.deleteById(id)
    }

    fun findOrdersByStatus(status: String): List<OrderDto> =
        orderRepository.findByStatus(status).map { OrderMapper.toDto(it) }

    fun findOrdersByDateRange(start: LocalDateTime, end: LocalDateTime): List<OrderDto> =
        orderRepository.findByOrderDateBetween(start, end).map { OrderMapper.toDto(it) }

    fun findOrdersByUserAndStatus(userId: Long, status: String): List<OrderDto> {
        val user: User = userRepository.findById(userId)
            .orElseThrow { NoSuchElementException("User not found") }
        return orderRepository.findByUserAndStatus(user, status).map { OrderMapper.toDto(it) }
    }
}
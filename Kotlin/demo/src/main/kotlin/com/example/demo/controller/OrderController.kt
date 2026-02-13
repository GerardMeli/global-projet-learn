package com.example.demo.controller

import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.format.annotation.DateTimeFormat

import com.example.demo.service.OrderService
import com.example.demo.model.Order
import com.example.demo.dto.OrderDto
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/orders")
class OrderController @Autowired constructor(
    private val orderService: OrderService
) {

    @GetMapping("/all/orders")
    fun getAllOrders(): ResponseEntity<List<OrderDto>> =
        ResponseEntity.ok(orderService.getAllOrders())

    @GetMapping("/{id}")
    fun getOrderById(@PathVariable id: Long): ResponseEntity<OrderDto> =
        ResponseEntity.ok(orderService.getOrderById(id))

    @PostMapping("/add/order")
    fun createOrder(@RequestBody dto: OrderDto): ResponseEntity<OrderDto> {
        val created = orderService.createOrder(dto)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @PutMapping("/{id}")
    fun updateOrder(
        @PathVariable id: Long,
        @RequestBody dto: OrderDto
    ): ResponseEntity<OrderDto> =
        ResponseEntity.ok(orderService.updateOrder(id, dto))

    @DeleteMapping("/{id}")
    fun deleteOrder(@PathVariable id: Long): ResponseEntity<Void> {
        orderService.deleteOrder(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/status/{status}")
    fun getOrdersByStatus(@PathVariable status: String): ResponseEntity<List<OrderDto>> =
        ResponseEntity.ok(orderService.findOrdersByStatus(status))

    @GetMapping("/user/{userId}/status/{status}")
    fun getOrdersByUserAndStatus(
        @PathVariable userId: Long,
        @PathVariable status: String
    ): ResponseEntity<List<OrderDto>> =
        ResponseEntity.ok(orderService.findOrdersByUserAndStatus(userId, status))

    @GetMapping("/range")
    fun getOrdersByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) start: LocalDateTime,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) end: LocalDateTime
    ): ResponseEntity<List<OrderDto>> =
        ResponseEntity.ok(orderService.findOrdersByDateRange(start, end))
}
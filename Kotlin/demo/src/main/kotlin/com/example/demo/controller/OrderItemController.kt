package com.example.demo.controller

import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.http.ResponseEntity
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus

import com.example.demo.service.OrderItemService
import com.example.demo.model.OrderItem
import com.example.demo.model.Product
import com.example.demo.dto.OrderItemDto
import com.example.demo.mapper.OrderItemMapper

@RestController
@RequestMapping("/api/order-items")
class OrderItemController @Autowired constructor(
    private val orderItemService: OrderItemService
) {

    @GetMapping("/all/items")
    fun getAllOrderItems(): ResponseEntity<List<OrderItemDto>> =
        ResponseEntity.ok(orderItemService.getAllOrderItems())

    @GetMapping("/{id}")
    fun getOrderItemById(@PathVariable id: Long): ResponseEntity<OrderItemDto> =
        ResponseEntity.ok(orderItemService.getOrderItemById(id))

    @PostMapping("/add/item")
    fun createOrderItem(@RequestBody dto: OrderItemDto): OrderItemDto {
        val orderItem = orderItemService.createOrderItem(dto)  // Entity
        return OrderItemMapper.toDto(orderItem)                // Convert Entity -> DTO
    }

    @PutMapping("/{id}")
    fun updateOrderItem(
        @PathVariable id: Long,
        @RequestBody dto: OrderItemDto
    ): ResponseEntity<OrderItemDto> =
        ResponseEntity.ok(orderItemService.updateOrderItem(id, dto))

    @DeleteMapping("/{id}")
    fun deleteOrderItem(@PathVariable id: Long): ResponseEntity<Void> {
        orderItemService.deleteOrderItem(id)
        return ResponseEntity.noContent().build()
    }
}
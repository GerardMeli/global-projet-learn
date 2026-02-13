package com.example.demo.repository

import org.springframework.stereotype.Repository
import org.springframework.data.jpa.repository.JpaRepository
import com.example.demo.model.OrderItem
import com.example.demo.model.Order

@Repository
interface OrderItemRepository : JpaRepository<OrderItem, Long> {

    fun deleteByProductId(productId: Long)
    
}
package com.example.demo.repository

import org.springframework.stereotype.Repository
import org.springframework.data.jpa.repository.JpaRepository
import com.example.demo.model.Order
import com.example.demo.model.User
import java.time.LocalDateTime


@Repository
interface OrderRepository : JpaRepository<Order, Long> {
    fun findByStatus(status: String): List<Order>
    fun findByOrderDateBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<Order>
    fun findByUserAndStatus(user: User, status: String): List<Order>
}
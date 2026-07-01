package com.example.manage_users.repository

import com.example.manage_users.models.Stock
import com.example.manage_users.utils.StockType
import com.example.manage_users.utils.StockUnit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface StockRepository: JpaRepository<Stock, String> {

    fun findByType(type: StockType): List<Stock>

    fun findByUnit(unit: StockUnit): List<Stock>

    fun findByWarehouse(warehouse: String): List<Stock>

    @Query("SELECT s FROM Stock s WHERE s.quantity <= s.threshold AND s.threshold > 0")
    fun findCriticalStocks(): List<Stock>

    @Query("SELECT s FROM Stock s WHERE s.quantity = 0")
    fun findOutOfStock(): List<Stock>

    @Query("SELECT s FROM Stock s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    fun findByNameContaining(@Param("name") name: String): List<Stock>

    @Query("SELECT s FROM Stock s WHERE s.type = :type AND s.quantity <= s.threshold")
    fun findCriticalByType(@Param("type") StockType: StockType): List<Stock>

    @Modifying
    @Query("UPDATE Stock s SET s.quantity = s.quantity - :quantity WHERE s.id = :id AND s.quantity >= :quantity")
    fun decrementQuantity(@Param("id") id: String, @Param("quantity") quantity: Float): Int

    @Modifying
    @Query("UPDATE Stock s SET s.quantity = s.quantity + :quantity WHERE s.id = :id")
    fun incrementQuantity(@Param("id") id: String, @Param("quantity") quantity: Float): Int

    @Query("SELECT SUM(s.quantity) FROM Stock s WHERE s.type = :type")
    fun sumQuantityByType(@Param("type") type: StockType): Float?
}
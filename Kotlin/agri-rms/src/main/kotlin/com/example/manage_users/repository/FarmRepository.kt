package com.example.manage_users.repository

import com.example.manage_users.models.Farm
import com.example.manage_users.utils.FarmStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface FarmRepository : JpaRepository<Farm, String> {

    fun findByStatus(status: FarmStatus): List<Farm>

    fun findByManagerId(managerId: String): List<Farm>

    fun findByCity(city: String): List<Farm>

    @Query("SELECT f FROM Farm f WHERE f.surfaceTotal >= :minSurface")
    fun findByMinSurface(@Param("minSurface") minSurface: Float): List<Farm>

    @Query("SELECT f FROM Farm f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    fun findByNameContaining(@Param("name") name: String): List<Farm>

    @Query("SELECT f FROM Farm f WHERE f.status = :status AND f.managerId = :managerId")
    fun findByStatusAndManagerId(@Param("status") status: FarmStatus, @Param("managerId") managerId: String): List<Farm>

    @Query("SELECT COUNT(f) FROM Farm f WHERE f.status = :status")
    fun countByStatus(@Param("status") status: FarmStatus): Long

    @Query("SELECT AVG(f.surfaceTotal) FROM Farm f")
    fun averageSurface(): Float?

    @Query("SELECT f.city, COUNT(f) FROM Farm f GROUP BY f.city")
    fun countFarmsByCity(): List<Array<Any>>
}
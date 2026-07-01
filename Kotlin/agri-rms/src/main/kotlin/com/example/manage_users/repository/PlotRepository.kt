package com.example.manage_users.repository

import com.example.manage_users.models.Plot
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime


interface PlotRepository : JpaRepository<Plot, String> {

    fun findByFarmId(farmId: String): List<Plot>

    fun findByFarmIdAndCulture(farmId: String, culture: String): List<Plot>

    @Query("SELECT p FROM Plot p WHERE p.farm.managerId = :managerId")
    fun findByManagerId(@Param("managerId") managerId: String): List<Plot>

    @Query("SELECT p FROM Plot p WHERE p.lastActivity < :date OR p.lastActivity IS NULL")
    fun findPlotsWithoutRecentActivity(@Param("date") date: LocalDateTime): List<Plot>

    @Query("SELECT p FROM Plot p WHERE p.surface >= :minSurface")
    fun findByMinSurface(@Param("minSurface") minSurface: Float): List<Plot>

    @Modifying
    @Query("UPDATE Plot p SET p.lastActivity = :lastActivity WHERE p.id = :plotId")
    fun updateLastActivity(@Param("plotId") plotId: String, @Param("lastActivity") LocalDateTime: LocalDateTime)

    @Query("SELECT COUNT(p) FROM Plot p WHERE p.farm.id = :farmId")
    fun countByFarmId(@Param("farmId") farmId: String): Long

    @Query("SELECT SUM(p.surface) FROM Plot p WHERE p.farm.id = :farmId")
    fun sumSurfaceByFarmId(@Param("farmId") farmId: String): Float?
}
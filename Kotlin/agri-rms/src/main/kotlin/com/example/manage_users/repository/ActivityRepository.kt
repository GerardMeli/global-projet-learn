package com.example.manage_users.repository

import com.example.manage_users.models.Activity
import com.example.manage_users.utils.ActivityStatus
import com.example.manage_users.utils.ActivityType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime
import java.util.UUID

interface ActivityRepository : JpaRepository<Activity, String> {

    fun findByPlotId(plotId: String): List<Activity>

    fun findByPlotIdAndStatus(plotId: String, status: ActivityStatus): List<Activity>

    fun findByType(type: ActivityType): List<Activity>

    fun findByOperatorId(operatorId: String): List<Activity>

    fun findByDateBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<Activity>

    fun findByPlotIdOrderByDateDesc(plotId: String): List<Activity>

    @Query("SELECT a FROM Activity a WHERE a.plot.farm.id = :farmId")
    fun findByFarmId(@Param("farmId") farmId: String): List<Activity>

    @Query("SELECT a FROM Activity a WHERE a.input.id = :stockId")
    fun findByStockId(@Param("stockId") stockId: String): List<Activity>

    @Query("SELECT COUNT(a) > 0 FROM Activity a WHERE a.plot.id = :plotId AND a.type = :type AND a.date >= :since")
    fun existsByPlotIdAndTypeAndDateAfter(
        @Param("plotId") plotId: String,
        @Param("type") type: ActivityType,
        @Param("since") since: LocalDateTime
    ): Boolean

    @Modifying
    @Query("UPDATE Activity a SET a.status = :status WHERE a.id = :id")
    fun updateStatus(@Param("id") id: String, @Param("status") status: ActivityStatus)

    @Query("SELECT a FROM Activity a WHERE a.input.id = :stockId AND a.status = 'PENDING'")
    fun findPendingByStockId(@Param("stockId") stockId: String): List<Activity>

     fun findByStatus(status: ActivityStatus): List<Activity>
}
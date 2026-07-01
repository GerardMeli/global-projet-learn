package com.example.manage_users.service.interf

import com.example.manage_users.dto.FarmDto
import com.example.manage_users.dto.PageDto
import com.example.manage_users.utils.FarmStatus
import org.springframework.data.domain.Pageable
import java.util.UUID

interface FarmService {

    fun createFarm(request: FarmDto.FarmCreateRequest): FarmDto.FarmResponse

    fun updateFarm(id: String, request: FarmDto.FarmUpdateRequest): FarmDto.FarmResponse

    fun getFarmById(id: String): FarmDto.FarmResponse

    fun getFarmDetailById(id: String): FarmDto.FarmDetailResponse

    fun deleteFarm(id: String)

    fun getAllFarms(pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse>

    fun getFarmsByStatus(status: FarmStatus, pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse>

    fun getFarmsByManagerId(managerId: String, pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse>

    fun getFarmsByCity(city: String, pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse>

    fun searchFarmsByName(name: String, pageable: Pageable): PageDto.PageResponse<FarmDto.FarmResponse>

    fun updateFarmStatus(id: String, request: FarmDto.FarmStatusUpdateRequest): FarmDto.FarmResponse

    fun getFarmSummary(managerId: String? = null): List<FarmDto.FarmSummaryResponse>

    fun getFarmStatistics(): FarmDto.FarmStatisticsResponse

    fun assignManager(farmId: String, managerId: String): FarmDto.FarmResponse

    fun removeManager(farmId: String): FarmDto.FarmResponse

}
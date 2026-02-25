package com.example.manage_users.service.interf

import com.example.manage_users.dto.StatisticsDto
import org.springframework.data.domain.Page
import java.awt.print.Pageable

interface StatisticsService {
    fun getUserStatistics(): StatisticsDto.UserStatisticsResponse
}
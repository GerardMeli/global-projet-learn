package com.example.manage_users.service.interf

import com.example.manage_users.dto.RespoStockDto

// ─────────────────────────────────────────────────────────────────────────────
//  RespoStockService — Interface
//  CREATE / READ / DELETE → SUPER_ADMIN uniquement.
//  UPDATE → SUPER_ADMIN ou D_GENERALE (délégation).
// ─────────────────────────────────────────────────────────────────────────────

interface RespoStockService {

    fun create(dto: RespoStockDto.RespoStockCreateDto): RespoStockDto.RespoStockResponseDto

    fun findAll(): List<RespoStockDto.RespoStockResponseDto>

    fun findById(id: String): RespoStockDto.RespoStockResponseDto

    fun update(id: String, dto: RespoStockDto.RespoStockUpdateDto): RespoStockDto.RespoStockResponseDto

    fun delete(id: String)

    fun search(query: String): List<RespoStockDto.RespoStockResponseDto>
}
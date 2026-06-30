package com.example.manage_users.service.interf

import com.example.manage_users.dto.AgTerrainDto

// ─────────────────────────────────────────────────────────────────────────────
//  AgTerrainService — Interface
//  CREATE / READ / DELETE → SUPER_ADMIN uniquement.
//  UPDATE → SUPER_ADMIN ou D_GENERALE (délégation).
// ─────────────────────────────────────────────────────────────────────────────

interface AgTerrainService {

    fun create(dto: AgTerrainDto.AgTerrainCreateDto): AgTerrainDto.AgTerrainResponseDto

    fun findAll(): List<AgTerrainDto.AgTerrainResponseDto>

    fun findById(id: String): AgTerrainDto.AgTerrainResponseDto

    fun update(id: String, dto: AgTerrainDto.AgTerrainUpdateDto): AgTerrainDto.AgTerrainResponseDto

    fun delete(id: String)

    fun search(query: String): List<AgTerrainDto.AgTerrainResponseDto>
}
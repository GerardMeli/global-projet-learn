package com.example.manage_users.service.interf

import com.example.manage_users.dto.AgCollectDto

// ─────────────────────────────────────────────────────────────────────────────
//  AgCollecteService — Interface
//  CREATE / READ / DELETE → SUPER_ADMIN uniquement.
//  UPDATE → SUPER_ADMIN ou D_GENERALE (délégation).
// ─────────────────────────────────────────────────────────────────────────────

interface AgCollecteService {

    fun create(dto: AgCollectDto.AgCollecteCreateDto): AgCollectDto.AgCollecteResponseDto

    fun findAll(): List<AgCollectDto.AgCollecteResponseDto>

    fun findById(id: String): AgCollectDto.AgCollecteResponseDto

    fun update(id: String, dto: AgCollectDto.AgCollecteUpdateDto): AgCollectDto.AgCollecteResponseDto

    fun delete(id: String)

    fun search(query: String): List<AgCollectDto.AgCollecteResponseDto>
}
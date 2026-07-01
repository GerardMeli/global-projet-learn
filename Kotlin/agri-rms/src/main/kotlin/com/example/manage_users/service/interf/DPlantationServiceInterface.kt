package com.example.manage_users.service.interf

import com.example.manage_users.dto.DPlantationDto

// ─────────────────────────────────────────────────────────────────────────────
//  DPlantationService — Interface
//  CREATE / READ / DELETE → SUPER_ADMIN uniquement.
//  UPDATE → SUPER_ADMIN ou D_GENERALE (délégation).
// ─────────────────────────────────────────────────────────────────────────────

interface DPlantationService {

    fun create(dto: DPlantationDto.DPlantationCreateDto): DPlantationDto.DPlantationResponseDto

    fun findAll(): List<DPlantationDto.DPlantationResponseDto>

    fun findById(id: String): DPlantationDto.DPlantationResponseDto

    fun update(id: String, dto: DPlantationDto.DPlantationUpdateDto): DPlantationDto.DPlantationResponseDto

    fun delete(id: String)

    fun search(query: String): List<DPlantationDto.DPlantationResponseDto>
}
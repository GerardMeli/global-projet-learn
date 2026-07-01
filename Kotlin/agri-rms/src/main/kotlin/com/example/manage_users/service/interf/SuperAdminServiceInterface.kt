package com.example.manage_users.service.interf

import com.example.manage_users.dto.SuperAdminDto

// ─────────────────────────────────────────────────────────────────────────────
//  SuperAdminService — Interface
//  CRUD complet, réservé au SUPER_ADMIN.
// ─────────────────────────────────────────────────────────────────────────────

interface SuperAdminService {

    /** Crée un nouvel utilisateur SUPER_ADMIN. */
    fun create(dto: SuperAdminDto.SuperAdminCreateDto): SuperAdminDto.SuperAdminResponseDto

    /** Retourne tous les utilisateurs SUPER_ADMIN. */
    fun findAll(): List<SuperAdminDto.SuperAdminResponseDto>

    /** Retourne un SUPER_ADMIN par son identifiant. */
    fun findById(id: String): SuperAdminDto.SuperAdminResponseDto

    /** Met à jour partiellement un SUPER_ADMIN. */
    fun update(id: String, dto: SuperAdminDto.SuperAdminUpdateDto): SuperAdminDto.SuperAdminResponseDto

    /** Recherche par email, prénom ou nom. */
    fun search(query: String): List<SuperAdminDto.SuperAdminResponseDto>
}
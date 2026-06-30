package com.example.manage_users.service.interf

import com.example.manage_users.dto.DGeneraleDto


// ─────────────────────────────────────────────────────────────────────────────
//  DGeneraleService — Interface
//  CREATE / READ / DELETE → SUPER_ADMIN uniquement.
//  UPDATE → SUPER_ADMIN ou D_GENERALE (délégation).
// ─────────────────────────────────────────────────────────────────────────────

interface DGeneraleService {

    /** Crée un D_GENERALE (SUPER_ADMIN only). */
    fun create(dto: DGeneraleDto.DGeneraleCreateDto): DGeneraleDto.DGeneraleResponseDto

    /** Liste tous les D_GENERALE. */
    fun findAll(): List<DGeneraleDto.DGeneraleResponseDto>

    /** Retourne un D_GENERALE par son identifiant. */
    fun findById(id: String): DGeneraleDto.DGeneraleResponseDto

    /**
     * Met à jour un D_GENERALE.
     * Les champs sensibles (status, isActive, permission) ne sont appliqués
     * que si l'appelant est SUPER_ADMIN — vérification faite dans l'impl.
     */
    fun update(id: String, dto: DGeneraleDto.DGeneraleUpdateDto): DGeneraleDto.DGeneraleResponseDto

    /** Suppression logique (SUPER_ADMIN only). */
    fun delete(id: String)

    /** Recherche par email, prénom ou nom. */
    fun search(query: String): List<DGeneraleDto.DGeneraleResponseDto>
}
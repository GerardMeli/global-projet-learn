package com.example.manage_users.service.impl

import com.example.manage_users.dto.SuperAdminDto
import com.example.manage_users.execption.ResourceAlreadyExistsException
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.mapper.UserMapper
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.service.interf.SuperAdminService
import com.example.manage_users.utils.UserRole
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

// ─────────────────────────────────────────────────────────────────────────────
//  SuperAdminServiceImpl
//  • Accès CRUD complet — sécurité gérée au niveau Controller via @PreAuthorize
//  • Toutes les opérations filtrent sur UserRole.SUPER_ADMIN
// ─────────────────────────────────────────────────────────────────────────────

@Service
@Transactional
class SuperAdminServiceImpl(
    private val repository: UsersRepository,
    private val passwordEncoder: PasswordEncoder,
    private val mapper: UserMapper
) : SuperAdminService {

    // ── CREATE ────────────────────────────────────────────────────────────────

    companion object {
        private val ROLE = UserRole.SUPER_ADMIN
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    override fun create(dto: SuperAdminDto.SuperAdminCreateDto): SuperAdminDto.SuperAdminResponseDto {
        if (repository.existsByEmail(dto.email)) {
            throw ResourceAlreadyExistsException("Un utilisateur avec l'email '${dto.email}' existe déjà.")
        }

        val entity = mapper.run { dto.toEntity(passwordEncoder) }   // <- ici, dto.toEntity() est visible
        val saved = repository.save(entity)
        return mapper.run { saved.toSuperAdminResponse() }
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    override fun findAll(): List<SuperAdminDto.SuperAdminResponseDto> =
        repository.findAllByRole(ROLE).map { mapper.run { it.toSuperAdminResponse() } }

    @Transactional(readOnly = true)
    override fun findById(id: String): SuperAdminDto.SuperAdminResponseDto =
        mapper.run { findEntityById(id).toSuperAdminResponse() }

    @Transactional(readOnly = true)
    override fun search(query: String): List<SuperAdminDto.SuperAdminResponseDto> =
        repository.searchByRoleAndQuery(ROLE, query)
            .map { mapper.run { it.toSuperAdminResponse() } }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    override fun update(id: String, dto: SuperAdminDto.SuperAdminUpdateDto): SuperAdminDto.SuperAdminResponseDto {
        // Vérifie unicité email si modifié
        dto.email?.let { newEmail ->
            val existing = repository.findByEmail(newEmail)
            if (existing.isPresent && existing.get().id != id) {
                throw ResourceAlreadyExistsException("L'email '$newEmail' est déjà utilisé.")
            }
        }

        val entity = findEntityById(id)

        // utilisation du mapper (applyUpdate)
        val updated = mapper.run { entity.applyUpdate(dto) }

        val saved = repository.save(updated)
        return mapper.run { saved.toSuperAdminResponse() }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun findEntityById(id: String) =
        repository.findByIdAndRole(id, ROLE)
            .orElseThrow { ResourceNotFoundException("SUPER_ADMIN introuvable avec l'id $id.") }

}
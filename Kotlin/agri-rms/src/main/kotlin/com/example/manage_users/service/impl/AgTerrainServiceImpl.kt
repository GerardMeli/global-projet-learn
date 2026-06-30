package com.example.manage_users.service.impl

import com.example.manage_users.dto.AgTerrainDto
import com.example.manage_users.execption.BusinessAccessDeniedException
import com.example.manage_users.execption.ResourceAlreadyExistsException
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.mapper.UserMapper
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.service.interf.AgTerrainService
import com.example.manage_users.service.interf.EmailService
import com.example.manage_users.service.interf.TokenService
import com.example.manage_users.utils.UserRole
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional


// ─────────────────────────────────────────────────────────────────────────────
//  AgTerrainServiceImpl
// ─────────────────────────────────────────────────────────────────────────────

@Service
@Transactional
class AgTerrainServiceImpl(
    private val repository: UsersRepository,
    private val passwordEncoder: PasswordEncoder,
    private val emailService: EmailService,
    private val tokenService: TokenService,
    private val mapper: UserMapper        // ← injection du mapper
) : AgTerrainService {

    private val role = UserRole.AG_TERRAIN

    // ── CREATE ───────────────────────────────────────────────────────────────
    override fun create(dto: AgTerrainDto.AgTerrainCreateDto): AgTerrainDto.AgTerrainResponseDto {
        assertSuperAdmin("Seul le SUPER_ADMIN peut créer un AG_TERRAIN.")

        if (repository.existsByEmail(dto.email)) {
            throw ResourceAlreadyExistsException("Email '${dto.email}' déjà utilisé.")
        }

        val entity = mapper.run { dto.toEntity(passwordEncoder) }   // <- extension visible ici
        val saved = repository.save(entity)

        // Générer le token d'invitation et envoyer l'email
        val token = tokenService.createAccountSetupToken(saved.id, saved.email)
        emailService.sendAccountSetupEmail(saved)

        return mapper.run { saved.toAgTerrainResponse() }
    }

    // ── READ ────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    override fun findAll(): List<AgTerrainDto.AgTerrainResponseDto> =
        repository.findAllByRole(role)
            .map { mapper.run { it.toAgTerrainResponse() } }

    @Transactional(readOnly = true)
    override fun findById(id: String): AgTerrainDto.AgTerrainResponseDto =
        mapper.run { findEntityById(id).toAgTerrainResponse() }

    @Transactional(readOnly = true)
    override fun search(query: String): List<AgTerrainDto.AgTerrainResponseDto> =
        repository.searchByRoleAndQuery(role, query)
            .map { mapper.run { it.toAgTerrainResponse() } }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    override fun update(id: String, dto: AgTerrainDto.AgTerrainUpdateDto): AgTerrainDto.AgTerrainResponseDto {
        assertCanUpdate(
            statusChanged = dto.status != null || dto.isActive != null,
            message = "Seul le SUPER_ADMIN peut modifier le statut ou l'activation d'un AG_TERRAIN."
        )

        dto.email?.let { newEmail ->
            val existing = repository.findByEmail(newEmail)
            if (existing.isPresent && existing.get().id != id) {
                throw ResourceAlreadyExistsException("L'email '$newEmail' est déjà utilisé.")
            }
        }

        val entity = mapper.run { findEntityById(id).applyUpdate(dto) }
        val saved = repository.save(entity)
        return mapper.run { saved.toAgTerrainResponse() }
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    override fun delete(id: String) {
        assertSuperAdmin("Seul le SUPER_ADMIN peut supprimer un AG_TERRAIN.")

        val deleted = repository.deleteByIdAndRole(id, role)

        if (deleted == 0) {
            throw ResourceNotFoundException("AG_TERRAIN introuvable avec l'id $id.")
        }
    }

    // ── HELPERS ─────────────────────────────────────────────────────────────
    private fun findEntityById(id: String) =
        repository.findByIdAndRole(id, role)
            .orElseThrow { ResourceNotFoundException("AG_TERRAIN introuvable avec l'id $id.") }
}

private fun currentUserRole(): UserRole {
    val auth = SecurityContextHolder.getContext().authentication
    val authority = auth.authorities.firstOrNull()?.authority
        ?: throw BusinessAccessDeniedException("Authentification requise.")
    return UserRole.valueOf(authority.removePrefix("ROLE_"))
}

private fun assertSuperAdmin(message: String) {
    if (currentUserRole() != UserRole.SUPER_ADMIN) throw BusinessAccessDeniedException(message)
}

private fun assertCanUpdate(statusChanged: Boolean, message: String) {
    if (statusChanged && currentUserRole() != UserRole.SUPER_ADMIN) throw BusinessAccessDeniedException(message)
}
package com.example.manage_users.service.impl

import com.example.manage_users.dto.AgCollectDto
import com.example.manage_users.execption.BusinessAccessDeniedException
import com.example.manage_users.execption.ResourceAlreadyExistsException
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.mapper.UserMapper
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.service.interf.AgCollecteService
import com.example.manage_users.service.interf.EmailService
import com.example.manage_users.service.interf.TokenService
import com.example.manage_users.utils.UserRole
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

// ─────────────────────────────────────────────────────────────────────────────
//  AgCollecteServiceImpl
// ─────────────────────────────────────────────────────────────────────────────

@Service
@Transactional
class AgCollecteServiceImpl(
    private val repository: UsersRepository,
    private val emailService: EmailService,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder,
    private val mapper: UserMapper           // ← injection du mapper
) : AgCollecteService {

    private val role = UserRole.AG_COLLECTE

    // ── CREATE ───────────────────────────────────────────────────────────────
    override fun create(dto: AgCollectDto.AgCollecteCreateDto): AgCollectDto.AgCollecteResponseDto {
        assertSuperAdmin("Seul le SUPER_ADMIN peut créer un AG_COLLECTE.")

        if (repository.existsByEmail(dto.email)) {
            throw ResourceAlreadyExistsException("Email '${dto.email}' déjà utilisé.")
        }

        val entity = mapper.run { dto.toEntity(passwordEncoder) }   // <- extension visible via mapper
        val saved = repository.save(entity)

        // Générer le token d'invitation et envoyer l'email
        val token = tokenService.createAccountSetupToken(saved.id, saved.email)
        emailService.sendAccountSetupEmail(saved)

        return mapper.run { saved.toAgCollecteResponse() }
    }

    // ── READ ────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    override fun findAll(): List<AgCollectDto.AgCollecteResponseDto> =
        repository.findAllByRole(role)
            .map { mapper.run { it.toAgCollecteResponse() } }

    @Transactional(readOnly = true)
    override fun findById(id: String): AgCollectDto.AgCollecteResponseDto =
        mapper.run { findEntityById(id).toAgCollecteResponse() }

    @Transactional(readOnly = true)
    override fun search(query: String): List<AgCollectDto.AgCollecteResponseDto> =
        repository.searchByRoleAndQuery(role, query)
            .map { mapper.run { it.toAgCollecteResponse() } }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    override fun update(id: String, dto: AgCollectDto.AgCollecteUpdateDto): AgCollectDto.AgCollecteResponseDto {
        assertCanUpdate(
            statusChanged = dto.status != null || dto.isActive != null,
            message = "Seul le SUPER_ADMIN peut modifier le statut ou l'activation d'un AG_COLLECTE."
        )

        dto.email?.let { newEmail ->
            val existing = repository.findByEmail(newEmail)
            if (existing.isPresent && existing.get().id != id) {
                throw ResourceAlreadyExistsException("L'email '$newEmail' est déjà utilisé.")
            }
        }

        val entity = mapper.run { findEntityById(id).applyUpdate(dto) }
        val saved = repository.save(entity)
        return mapper.run { saved.toAgCollecteResponse() }
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    override fun delete(id: String) {
        assertSuperAdmin("Seul le SUPER_ADMIN peut supprimer un AG_COLLECTE.")

        val deleted = repository.deleteByIdAndRole(id, role)

        if (deleted == 0) {
            throw ResourceNotFoundException("AG_COLLECTE introuvable avec l'id $id.")
        }
    }


    // ── HELPERS ─────────────────────────────────────────────────────────────
    private fun findEntityById(id: String) =
        repository.findByIdAndRole(id, role)
            .orElseThrow { ResourceNotFoundException("AG_COLLECTE introuvable avec l'id $id.") }
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
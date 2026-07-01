package com.example.manage_users.service.impl

import com.example.manage_users.dto.DPlantationDto
import com.example.manage_users.execption.BusinessAccessDeniedException
import com.example.manage_users.execption.ResourceAlreadyExistsException
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.mapper.UserMapper
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.service.interf.DPlantationService
import com.example.manage_users.service.interf.EmailService
import com.example.manage_users.service.interf.TokenService
import com.example.manage_users.utils.UserRole
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

// ─────────────────────────────────────────────────────────────────────────────
//  Utilitaire partagé pour récupérer le rôle de l'utilisateur connecté.
//  Utilisé par les 4 implémentations ci-dessous.
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
//  DPlantationServiceImpl
// ─────────────────────────────────────────────────────────────────────────────

@Service
@Transactional
class DPlantationServiceImpl(
    private val repository: UsersRepository,
    private val passwordEncoder: PasswordEncoder,
    private val emailService: EmailService,
    private val tokenService: TokenService,
    private val mapper: UserMapper          // ← Injection du mapper
) : DPlantationService {

    private val role = UserRole.D_PLANTATION

    // ── CREATE ───────────────────────────────────────────────────────────────
    override fun create(dto: DPlantationDto.DPlantationCreateDto): DPlantationDto.DPlantationResponseDto {
        assertSuperAdmin("Seul le SUPER_ADMIN peut créer un D_PLANTATION.")

        if (repository.existsByEmail(dto.email)) {
            throw ResourceAlreadyExistsException("Email '${dto.email}' déjà utilisé.")
        }

        val entity = mapper.run { dto.toEntity(passwordEncoder) }        // ← ici l’extension devient visible
        val saved = repository.save(entity)

        // Générer le token d’invitation et envoyer l’email
        val token = tokenService.createAccountSetupToken(saved.id, saved.email)
        emailService.sendAccountSetupEmail(saved)

        return mapper.run { saved.toDPlantationResponse() }
    }

    // ── READ ────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    override fun findAll(): List<DPlantationDto.DPlantationResponseDto> =
        repository.findAllByRole(role)
            .map { mapper.run { it.toDPlantationResponse() } }

    @Transactional(readOnly = true)
    override fun findById(id: String): DPlantationDto.DPlantationResponseDto =
        mapper.run { findEntityById(id).toDPlantationResponse() }

    @Transactional(readOnly = true)
    override fun search(query: String): List<DPlantationDto.DPlantationResponseDto> =
        repository.searchByRoleAndQuery(role, query)
            .map { mapper.run { it.toDPlantationResponse() } }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    override fun update(id: String, dto: DPlantationDto.DPlantationUpdateDto): DPlantationDto.DPlantationResponseDto {
        assertCanUpdate(
            statusChanged = dto.status != null || dto.isActive != null,
            message = "Seul le SUPER_ADMIN peut modifier le statut ou l'activation d'un D_PLANTATION."
        )

        dto.email?.let { newEmail ->
            val existing = repository.findByEmail(newEmail)
            if (existing.isPresent && existing.get().id != id) {
                throw ResourceAlreadyExistsException("L'email '$newEmail' est déjà utilisé.")
            }
        }

        val entity = mapper.run { findEntityById(id).applyUpdate(dto) }
        val saved = repository.save(entity)
        return mapper.run { saved.toDPlantationResponse() }
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    override fun delete(id: String) {
        assertSuperAdmin("Seul le SUPER_ADMIN peut supprimer un D_PLANTATION.")

        val deleted = repository.deleteByIdAndRole(id, role)

        if (deleted == 0) {
            throw ResourceNotFoundException("D_PLANTATION introuvable avec l'id $id.")
        }
    }

    // ── HELPERS ─────────────────────────────────────────────────────────────
    private fun findEntityById(id: String) =
        repository.findByIdAndRole(id, role)
            .orElseThrow { ResourceNotFoundException("D_PLANTATION introuvable avec l'id $id.") }

}

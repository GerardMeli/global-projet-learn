package com.example.manage_users.service.impl

import com.example.manage_users.dto.DGeneraleDto
import com.example.manage_users.execption.BusinessAccessDeniedException
import com.example.manage_users.execption.ResourceAlreadyExistsException
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.mapper.UserMapper
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.service.interf.DGeneraleService
import com.example.manage_users.service.interf.EmailService
import com.example.manage_users.service.interf.TokenService
import com.example.manage_users.utils.UserRole
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class DGeneraleServiceImpl(
    private val repository: UsersRepository,
    private val emailService: EmailService,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder,
    private val mapper: UserMapper       // ← Injection du mapper
) : DGeneraleService {

    companion object {
        private val ROLE = UserRole.D_GENERALE
    }

    // ── CREATE (SUPER_ADMIN only) ─────────────────────────────────────────────

    override fun create(dto: DGeneraleDto.DGeneraleCreateDto): DGeneraleDto.DGeneraleResponseDto {
        assertSuperAdmin("Seul le SUPER_ADMIN peut créer un D_GENERALE.")

        if (repository.existsByEmail(dto.email)) {
            throw ResourceAlreadyExistsException("Un utilisateur avec l'email '${dto.email}' existe déjà.")
        }

        val entity = mapper.run { dto.toEntity(passwordEncoder) }
        val saved = repository.save(entity)

        // Générer le token d'invitation et envoyer l'email
        val token = tokenService.createAccountSetupToken(saved.id, saved.email)
        emailService.sendAccountSetupEmail(saved)

        return mapper.run { saved.toDGeneraleResponse() }
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    override fun findAll(): List<DGeneraleDto.DGeneraleResponseDto> =
        repository.findAllByRole(ROLE)
            .map { mapper.run { it.toDGeneraleResponse() } }

    @Transactional(readOnly = true)
    override fun findById(id: String): DGeneraleDto.DGeneraleResponseDto =
        mapper.run { findEntityById(id).toDGeneraleResponse() }

    @Transactional(readOnly = true)
    override fun search(query: String): List<DGeneraleDto.DGeneraleResponseDto> =
        repository.searchByRoleAndQuery(ROLE, query)
            .map { mapper.run { it.toDGeneraleResponse() } }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    override fun update(id: String, dto: DGeneraleDto.DGeneraleUpdateDto): DGeneraleDto.DGeneraleResponseDto {
        val caller = currentUserRole()

        if (caller != UserRole.SUPER_ADMIN) {
            if (dto.status != null || dto.isActive != null || dto.permission != null) {
                throw BusinessAccessDeniedException(
                    "Le D_GENERALE ne peut pas modifier le statut, l'activation ou la permission d'un compte."
                )
            }
        }

        // Vérifie unicité email
        dto.email?.let { newEmail ->
            val existing = repository.findByEmail(newEmail)
            if (existing.isPresent && existing.get().id != id) {
                throw ResourceAlreadyExistsException("L'email '$newEmail' est déjà utilisé.")
            }
        }

        val entity = findEntityById(id)
        val updated = mapper.run { entity.applyUpdate(dto) }

        val saved = repository.save(updated)
        return mapper.run { saved.toDGeneraleResponse() }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    override fun delete(id: String) {
        assertSuperAdmin("Seul le SUPER_ADMIN peut supprimer un D_GENERALE.")

        val deleted = repository.deleteByIdAndRole(id, ROLE)

        if (deleted == 0) {
            throw ResourceNotFoundException("D_GENERALE introuvable avec l'id $id.")
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun findEntityById(id: String) =
        repository.findByIdAndRole(id, ROLE)
            .orElseThrow { ResourceNotFoundException("D_GENERALE introuvable avec l'id $id.") }

    private fun currentUserRole(): UserRole {
        val auth = SecurityContextHolder.getContext().authentication
        val authority = auth.authorities.firstOrNull()?.authority
            ?: throw BusinessAccessDeniedException("Authentification requise.")
        return UserRole.valueOf(authority.removePrefix("ROLE_"))
    }

    private fun assertSuperAdmin(message: String) {
        if (currentUserRole() != UserRole.SUPER_ADMIN) {
            throw BusinessAccessDeniedException(message)
        }
    }
}
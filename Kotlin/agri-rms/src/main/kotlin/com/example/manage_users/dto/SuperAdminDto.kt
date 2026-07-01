package com.example.manage_users.dto

import com.example.manage_users.utils.*
import jakarta.validation.constraints.*

class SuperAdminDto {

    // ─────────────────────────────────────────────
//  SUPER_ADMIN DTOs
//  Accès : CRUD complet (seul le SUPER_ADMIN)
//          Le D_GENERALE peut UPDATE en cas d'indisponibilité
// ─────────────────────────────────────────────

    /**
     * Création d'un utilisateur SUPER_ADMIN.
     * Réservé exclusivement au SUPER_ADMIN connecté.
     */
    data class SuperAdminCreateDto(

        @field:Email(message = "Email invalide")
        @field:NotBlank(message = "L'email est obligatoire")
        val email: String,

        @field:NotBlank(message = "Le mot de passe est obligatoire")
        @field:Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        val password: String? = null,

        @field:Size(max = 100)
        val firstName: String? = null,

        @field:Size(max = 100)
        val lastName: String? = null,

        @field:Pattern(
            regexp = "^\\+237\\s6\\d{2}\\s\\d{3}\\s\\d{3}$",
            message = "Format invalide. Exemple : +237 698 520 147"
        )
        val phoneNumber: String? = null,

        val language: Language = Language.FR,

        // Un SUPER_ADMIN peut assigner n'importe quel rôle et permission
        val role: UserRole = UserRole.SUPER_ADMIN,
        val permission: Permission = Permission.TOTAL,
        val status: UserStatus = UserStatus.PENDING_VERIFICATION,
        val emailNotifications: Boolean = true
    )

    /**
     * Mise à jour d'un utilisateur SUPER_ADMIN.
     * Tous les champs sont optionnels (patch partiel).
     */
    data class SuperAdminUpdateDto(

        @field:Email(message = "Email invalide")
        val email: String? = null,

        @field:Size(max = 100)
        val firstName: String? = null,

        @field:Size(max = 100)
        val lastName: String? = null,

        @field:Pattern(
            regexp = "^\\+237\\s6\\d{2}\\s\\d{3}\\s\\d{3}$",
            message = "Format invalide. Exemple : +237 698 520 147"
        )
        val phoneNumber: String? = null,

        @field:Size(max = 45)
        val address: String? = null,

        val language: Language? = null,
        val isActive: Boolean? = null,
        val emailNotifications: Boolean? = null
    )

    /**
     * Réponse (lecture) pour un utilisateur SUPER_ADMIN.
     * Expose tous les champs (vue complète).
     */
    data class SuperAdminResponseDto(
        val id: String,
        val email: String,
        val firstName: String?,
        val lastName: String?,
        val phoneNumber: String?,
        val address: String?,
        val role: UserRole,
        val permission: Permission,
        val status: UserStatus,
        val isActive: Boolean,
        val emailVerified: Boolean,
        val failedLoginAttempts: Int,
        val language: Language,
        val emailNotifications: Boolean,
        val createdAt: String
    )

}
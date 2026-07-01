package com.example.manage_users.dto

import com.example.manage_users.utils.Language
import com.example.manage_users.utils.Permission
import com.example.manage_users.utils.UserRole
import com.example.manage_users.utils.UserStatus
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

class DGeneraleDto {

    // ─────────────────────────────────────────────
//  D_GENERALE DTOs
//  Accès : UPDATE uniquement (délégué par le SUPER_ADMIN)
//          Pas de CREATE ni DELETE sur ce rôle
//  Permission assignée : DECISIONNEL
// ─────────────────────────────────────────────

    /**
     * Création d'un utilisateur D_GENERALE.
     * Seul le SUPER_ADMIN peut créer ce type d'utilisateur.
     */
    data class DGeneraleCreateDto(

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
        val emailNotifications: Boolean = true,

        // Rôle et permission fixés pour ce profil
        val role: UserRole = UserRole.D_GENERALE,
        val permission: Permission = Permission.DECISIONNEL,
        val status: UserStatus = UserStatus.PENDING_VERIFICATION
    )

    /**
     * Mise à jour d'un utilisateur D_GENERALE.
     * Le D_GENERALE peut s'auto-modifier (profil limité).
     * Le SUPER_ADMIN peut tout modifier.
     * Champs sensibles (role, permission, status) réservés au SUPER_ADMIN côté service.
     */
    data class DGeneraleUpdateDto(

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
        val emailNotifications: Boolean? = null,

        // ⚠️ Champs réservés SUPER_ADMIN — à vérifier côté service/controller
        val status: UserStatus? = null,
        val isActive: Boolean? = null,
        val permission: Permission? = null
    )

    /**
     * Réponse (lecture) pour un utilisateur D_GENERALE.
     */
    data class DGeneraleResponseDto(
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
        val language: Language,
        val emailNotifications: Boolean,
        val createdAt: String
    )


}
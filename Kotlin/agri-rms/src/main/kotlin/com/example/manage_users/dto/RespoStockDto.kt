package com.example.manage_users.dto

import com.example.manage_users.utils.Language
import com.example.manage_users.utils.Permission
import com.example.manage_users.utils.UserRole
import com.example.manage_users.utils.UserStatus
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

class RespoStockDto {

    // ─────────────────────────────────────────────
//  RESPO_STOCK DTOs
//  Accès : CRUD géré par SUPER_ADMIN
//          UPDATE délégué au D_GENERALE si besoin
//  Permission assignée : OPERATIONEL
// ─────────────────────────────────────────────

    /**
     * Création d'un Responsable Stock.
     */
    data class RespoStockCreateDto(

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

        @field:Size(max = 45)
        val address: String? = null,

        val language: Language = Language.FR,
        val emailNotifications: Boolean = true,

        val role: UserRole = UserRole.RESPO_STOCK,
        val permission: Permission = Permission.LOGISTIQUE,
        val status: UserStatus = UserStatus.PENDING_VERIFICATION
    )

    /**
     * Mise à jour d'un Responsable Stock.
     */
    data class RespoStockUpdateDto(

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

        // ⚠️ Réservés au SUPER_ADMIN / D_GENERALE délégué
        val status: UserStatus? = null,
        val isActive: Boolean? = null
    )

    /**
     * Réponse pour un Responsable Stock.
     */
    data class RespoStockResponseDto(
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
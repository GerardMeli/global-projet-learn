package com.example.manage_users.mapper

import com.example.manage_users.dto.AdminDto
import com.example.manage_users.dto.AgriUserDto
import com.example.manage_users.dto.ProfileDto
import com.example.manage_users.dto.RegistrationDto
import com.example.manage_users.models.Language
import com.example.manage_users.models.Theme
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import com.example.manage_users.models.Users
import org.springframework.stereotype.Component

@Component
class UserMapper {

    fun toProfileResponse(user: Users): ProfileDto.UserProfileResponse {
        return ProfileDto.UserProfileResponse(
            id = user.id,
            email = user.email,
            firstName = user.firstName,
            lastName = user.lastName,
            phoneNumber = user.phoneNumber,
            address = user.address,
            role = user.role,
            status = user.status,
            isActive = user.isActive,
            emailVerified = user.emailVerified,
            language = user.language,
            theme = user.theme,
            emailNotifications = user.emailNotifications,
            createdAt = user.createdAt,
            failedLoginAttempts = user.failedLoginAttempts
        )
    }

    fun toAdminResponse(user: Users): AdminDto.AdminUserResponse {
        return AdminDto.AdminUserResponse(
            id = user.id,
            email = user.email,
            firstName = user.firstName,
            lastName = user.lastName,
            role = user.role,
            status = user.status,
            isActive = user.isActive,
            emailVerified = user.emailVerified,
            failedLoginAttempts = user.failedLoginAttempts,
            createdAt = user.createdAt,
            lastLoginAt = null,
            phoneNumber = user.phoneNumber,
            address = user.address,
            language = user.language,
            theme = user.theme
        )
    }

    fun updateUserFromRequest(
        user: Users,
        request: AdminDto.AdminUserUpdateRequest
    ): Users {
        request.firstName?.let { user.firstName = it }
        request.lastName?.let { user.lastName = it }
        request.phoneNumber?.let { user.phoneNumber = it }
        request.address?.let { user.address = it }
        request.role?.let { user.role = it }
        request.status?.let { user.status = it }
        request.isActive?.let { user.isActive = it }
        request.emailVerified?.let { user.emailVerified = it }
        request.failedLoginAttempts?.let { user.failedLoginAttempts = it }
        request.language?.let { user.language = it }
        request.theme?.let { user.theme = it }
        request.emailNotifications?.let { user.emailNotifications = it }
        return user
    }

    fun mapToUserResponse(user: Users): RegistrationDto.UserResponse {
        return RegistrationDto.UserResponse(
            id = user.id,
            email = user.email,
            role = user.role,
            isActive = user.isActive,
            createdAt = user.createdAt
        )
    }

    fun toUser(agriUser: AgriUserDto, encodedPassword: String): Users {

        return Users(
            id = 0,  // généré par Postgres

            // ── Identité ──────────────────────────────────────────
            email     = agriUser.userEmail
                ?: throw IllegalArgumentException(
                    "Email manquant pour ${agriUser.userCode}"
                ),
            firstName = agriUser.userFirstName
                ?.trim()?.ifBlank { "Prénom" } ?: "Prénom",
            lastName  = agriUser.userLastName
                ?.trim()?.ifBlank { "Nom" } ?: "Nom",

            // ── Sécurité ──────────────────────────────────────────
            password             = encodedPassword,
            emailVerified        = false,   // devra vérifier son email
            failedLoginAttempts  = 0,

            // ── Statut ────────────────────────────────────────────
            // Agriculture "CREATE_BUT_NOT_ACTIVE" → PENDING_VERIFICATION
            // Agriculture "ACTIVE"                → ACTIVE
            isActive = agriUser.isActive,
            status   = mapperStatut(agriUser.state, agriUser.isActive),

            // ── Rôle ──────────────────────────────────────────────
            // "RESPONSABLE" / "USER" → USER
            // "ADMIN"                → ADMIN
            role = mapperRole(agriUser.userType),

            // ── Contact ───────────────────────────────────────────
            phoneNumber = formaterTelephone(agriUser.userPhoneNumber),

            // ── Adresse ───────────────────────────────────────────
            // On concatène ville + région  (max 45 chars selon ta colonne)
            address = construireAdresse(agriUser),

            // ── Préférences par défaut ────────────────────────────
            language           = Language.FR,
            theme              = Theme.LIGHT,
            emailNotifications = true
        )
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers privés
    // ─────────────────────────────────────────────────────────────

    private fun mapperStatut(state: String?, isActive: Boolean): UserStatus {
        if (isActive) return UserStatus.ACTIVE
        return when (state?.uppercase()) {
            "ACTIVE"                -> UserStatus.ACTIVE
            "INACTIVE"              -> UserStatus.INACTIVE
            "SUSPENDED"             -> UserStatus.SUSPENDED
            "DELETED"               -> UserStatus.DELETED
            "CREATE_BUT_NOT_ACTIVE" -> UserStatus.PENDING_VERIFICATION
            else                    -> UserStatus.PENDING_VERIFICATION
        }
    }

    private fun mapperRole(userType: String?): UserRole {
        return when (userType?.uppercase()) {
            "ADMIN"        -> UserRole.ADMIN
            "SUPPORT"      -> UserRole.SUPPORT
            "RESPONSABLE",
            "USER"         -> UserRole.USER
            else           -> UserRole.USER
        }
    }

    private fun formaterTelephone(raw: String?): String? {
        if (raw.isNullOrBlank()) return null

        // Agriculture envoie "6 74 34 56 79"
        // ton @Pattern attend "+237 6XX XXX XXX"
        val chiffres = raw.replace(" ", "").replace("+237", "")

        // Si le numéro fait 9 chiffres → format camerounais complet
        if (chiffres.length == 9) {
            // "674345679" → "+237 674 345 679"
            return "+237 ${chiffres.substring(0,3)} " +
                    "${chiffres.substring(3,6)} " +
                    chiffres.substring(6)
        }

        // Si 8 chiffres (sans le 6 initial) : "6" + les 8 chiffres
        if (chiffres.length == 8) {
            val complet = "6$chiffres"
            return "+237 ${complet.substring(0,3)} " +
                    "${complet.substring(3,6)} " +
                    complet.substring(6)
        }

        return null  // format inconnu → on ne stocke pas
    }

    private fun construireAdresse(agriUser: AgriUserDto): String? {
        val parts = listOfNotNull(
            agriUser.address?.addressCity?.ifBlank { null },
            agriUser.address?.region?.ifBlank { null }
        )
        val adresse = parts.joinToString(", ")
        // ta colonne address est VARCHAR(45)
        return adresse.ifBlank { null }?.take(45)
    }

}
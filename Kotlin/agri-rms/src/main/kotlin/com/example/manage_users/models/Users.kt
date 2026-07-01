package com.example.manage_users.models

import com.example.manage_users.utils.UserRole
import com.example.manage_users.utils.UserStatus
import com.example.manage_users.utils.Language
import com.example.manage_users.utils.Permission
import com.example.manage_users.utils.UsersIdGenerator
import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Pattern
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime
// ─────────────────────────────────────────────────────────────────────────────
//  Users Entity
//
//  ID au format métier : USERS-{ROLE}_{UUID_COURT}
//  Exemples :
//    USERS-SUPER_ADMIN_a3f9b2c1
//    USERS-AG_COLLECTE_7e4d1a8f
//
//  @PrePersist génère automatiquement l'ID avant chaque insertion
//  si l'id est vide — pas besoin de le passer dans les DTOs.
// ─────────────────────────────────────────────────────────────────────────────

@Entity
@Table(
    name = "users",
    indexes = [
        Index(name = "idx_email", columnList = "email"),
        Index(name = "idx_status", columnList = "status"),
        Index(name = "idx_role", columnList = "role"),
        Index(name = "idx_created_at", columnList = "created_at")
    ]
)
data class Users (

    @Id
    @Column(name = "id", length = 40, nullable = false, updatable = false)
    var id: String = "",

    @Column(unique = true, nullable = false)
    @Email
    var email: String,

    @Column(length = 100)
    var firstName: String? = null,

    @Column(length = 100)
    var lastName: String? = null,

    @Column(nullable = false)
    var password: String? = null,

    @Column(name = "is_active")
    var isActive: Boolean = true,

    @CreationTimestamp
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Enumerated(EnumType.STRING)
    var role: UserRole = UserRole.USER,

    @Column(length = 20)
    @Pattern(
        regexp = "^\\+237\\s6\\d{2}\\s\\d{3}\\s\\d{3}$",
        message = "Invalid Cameroonian phone number format. Example: +237 698 520 147"
    )
    var phoneNumber: String? = null,

    @Column
    var failedLoginAttempts: Int = 0,

    @Column
    var emailVerified: Boolean = false,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var status: UserStatus = UserStatus.PENDING_VERIFICATION,

    @Column(length = 45)
    var address: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    var language: Language = Language.FR,

    @Column
    var emailNotifications: Boolean = true,

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    var permission: Permission = Permission.AUCUNE

) {
    /**
     * Génère automatiquement l'ID avant insertion en base.
     * Format : USERS-{ROLE}_{UUID_COURT}
     * Ne s'exécute que si l'id est vide (protection contre les appels multiples).
     */
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = UsersIdGenerator.generate(role)
        }
    }
}

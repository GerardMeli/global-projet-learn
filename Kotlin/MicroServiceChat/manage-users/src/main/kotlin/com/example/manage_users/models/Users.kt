package com.example.manage_users.models

import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Pattern
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

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

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long,

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
    var theme: Theme = Theme.LIGHT

)

enum class UserRole {
    USER,
    ADMIN,
    SUPPORT
}

enum class UserStatus {
    PENDING_VERIFICATION,
    ACTIVE,
    INACTIVE,
    SUSPENDED,
    BLOCKED,
    DELETED,
    PENDING
}

enum class Language {
    FR,  // Français
    EN,  // Anglais
    ES,  // Espagnol
    DE,  // Allemand
    IT   // Italien
}

enum class Theme {
    LIGHT,
    DARK,
    SYSTEM
}
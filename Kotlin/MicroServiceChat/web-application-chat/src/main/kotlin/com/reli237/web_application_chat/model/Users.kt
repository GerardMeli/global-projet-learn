package com.reli237.web_application_chat.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
data class Users(

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long,

    @Column(unique = true, nullable = false)
    val email: String,

    @Column(nullable = false)
    val password: String,

    @Column(name = "is_active")
    val isActive: Boolean = true,

    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Enumerated(EnumType.STRING)
    val role: UserRole = UserRole.USER,

    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    @JsonIgnore  // ✅ EMPÊCHE la sérialisation de cette relation
    val chatParticipants: List<ChatParticipant> = mutableListOf()

)

enum class UserRole {
    USER, ADMIN
}
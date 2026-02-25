package com.reli237.web_application_chat.model

import com.reli237.web_application_chat.dto.UserDto
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import java.time.LocalDateTime

@Entity
data class ChatParticipant(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long,

    // Stocker uniquement l'ID de l'utilisateur, pas toute l'entité
    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")
    val chatRoom: ChatRoom,

    val joinedAt: LocalDateTime = LocalDateTime.now(),

    @Enumerated(EnumType.STRING)
    val role: ParticipantRole = ParticipantRole.MEMBER
)

enum class ParticipantRole {
    ADMIN, MODERATOR, MEMBER
}


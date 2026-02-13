package com.reli237.web_application_chat.model

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_id")
    val user: Users,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")
    val chatRoom: ChatRoom,

    val joinedAt: LocalDateTime = LocalDateTime.now(),

    @Enumerated(EnumType.STRING)
    val role: ParticipantRole = ParticipantRole.MEMBER
) {
}

enum class ParticipantRole {
    ADMIN, MODERATOR, MEMBER
}


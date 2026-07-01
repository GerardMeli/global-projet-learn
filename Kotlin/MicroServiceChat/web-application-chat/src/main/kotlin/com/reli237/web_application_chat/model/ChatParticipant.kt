package com.reli237.web_application_chat.model

import com.example.manage_users.utils.ChatIdGenerator
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.PrePersist
import java.time.LocalDateTime
import kotlin.text.isBlank

@Entity
data class ChatParticipant(

    @Id
    @Column(name = "id", length = 40, nullable = false, updatable = false)
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: String = "",

    // Stocker uniquement l'ID de l'utilisateur, pas toute l'entité
    @Column(name = "user_id", nullable = false)
    val userId: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")
    val chatRoom: ChatRoom,

    val joinedAt: LocalDateTime = LocalDateTime.now(),

    @Enumerated(EnumType.STRING)
    val role: ParticipantRole = ParticipantRole.MEMBER
){
    @PrePersist
    fun participant() {
        if (id.isBlank())
            id = ChatIdGenerator.forChatParticipant()
    }
}

enum class ParticipantRole {
    ADMIN, MODERATOR, MEMBER
}


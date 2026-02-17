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
data class Message(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long,

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String,

    // CORRECTION: Stocker l'ID au lieu de l'entité
    @Column(name = "sender_id", nullable = false)
    val senderId: Long,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")
    val chatRoom: ChatRoom,

    @Column(nullable = false)
    val timeStamp: LocalDateTime = LocalDateTime.now(),

    @Enumerated(EnumType.STRING)
    val messageType: MessageType = MessageType.TEXT,

    @Column(name = "is_deleted")
    var isDeleted: Boolean = false

    )

enum class MessageType {
    TEXT, FILE, IMAGE
}

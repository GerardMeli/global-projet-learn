package com.reli237.web_application_chat.model

import com.example.manage_users.utils.ChatIdGenerator
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
import jakarta.persistence.PrePersist
import java.time.LocalDateTime

@Entity
data class Message(

    @Column(name = "id", length = 40, nullable = false, updatable = false)
    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: String = "",

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String,

    // CORRECTION: Stocker l'ID au lieu de l'entité
    @Column(name = "sender_id", nullable = false)
    val senderId: String,

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
{
    @PrePersist
    fun message() {
        if (id.isBlank())
            id = ChatIdGenerator.forMesage()
    }
}

enum class MessageType {
    TEXT, FILE, IMAGE
}
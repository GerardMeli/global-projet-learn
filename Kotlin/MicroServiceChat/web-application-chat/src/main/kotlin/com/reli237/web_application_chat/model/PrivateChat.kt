package com.reli237.web_application_chat.model

import com.example.manage_users.utils.ChatIdGenerator
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.reli237.web_application_chat.dto.UserDto
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class PrivateChat(

    @Id
    @Column(columnDefinition = "varchar(37)", updatable = false, nullable = false)
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: String = "",

    // CORRECTION: Stocker les IDs au lieu des entités UserDto.UserResponse
    @Column(name = "sender_id_1", nullable = false)
    val senderId1: String,

    @Column(name = "sender_id_2", nullable = false)
    val senderId2: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String,

    @Column(nullable = false)
    val timestamp: LocalDateTime = LocalDateTime.now(),

    @Column(name = "is_read", nullable = false)
    val isRead: Boolean = false

)
{
    @PrePersist
    fun private() {
        if (id.isBlank())
            id = ChatIdGenerator.forPrivate()
    }
}
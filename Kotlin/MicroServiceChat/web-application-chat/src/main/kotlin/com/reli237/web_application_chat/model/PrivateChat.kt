package com.reli237.web_application_chat.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.reli237.web_application_chat.dto.UserDto
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class PrivateChat(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    // CORRECTION: Stocker les IDs au lieu des entités UserDto.UserResponse
    @Column(name = "sender_id_1", nullable = false)
    val senderId1: Long,

    @Column(name = "sender_id_2", nullable = false)
    val senderId2: Long,

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String,

    @Column(nullable = false)
    val timestamp: LocalDateTime = LocalDateTime.now(),

    @Column(name = "is_read", nullable = false)
    val isRead: Boolean = false

)

package com.reli237.web_application_chat.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class PrivateChat(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id_1", nullable = false)
    @JsonIgnoreProperties("chatParticipants", "password")  // ✅ Ignore des propriétés spécifiques
    val senderId1: Users,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id_2", nullable = false)
    @JsonIgnoreProperties("chatParticipants", "password")  // ✅ Ignore des propriétés spécifiques
    val senderId2: Users,

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String,

    @Column(nullable = false)
    val timestamp: LocalDateTime = LocalDateTime.now(),

    @Column(name = "is_read", nullable = false)
    val isRead: Boolean = false

)

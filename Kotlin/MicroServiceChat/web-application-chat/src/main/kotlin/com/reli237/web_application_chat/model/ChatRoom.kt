package com.reli237.web_application_chat.model

import com.example.manage_users.utils.ChatIdGenerator
import jakarta.persistence.*
import kotlin.text.isBlank

@Entity
data class ChatRoom(

    @Id
    @Column(name = "id", length = 40, nullable = false, updatable = false)
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: String = "",

    @Column(nullable = false)
    var name: String,

    @Enumerated(EnumType.STRING)
    var type: ChatRoomType = ChatRoomType.PRIVATE,

    @OneToMany(mappedBy = "chatRoom", cascade = [CascadeType.ALL])
    val participants: List<ChatParticipant> = mutableListOf(),

    @OneToMany(mappedBy = "chatRoom", cascade = [CascadeType.ALL])
    val messages: List<Message> = mutableListOf()

){
    @PrePersist
    fun chatRoom() {
        if (id.isBlank())
            id = ChatIdGenerator.forChatRoom()
    }
}

enum class ChatRoomType {
    PRIVATE, PUBLIC
}

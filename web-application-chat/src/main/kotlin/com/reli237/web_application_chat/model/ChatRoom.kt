package com.reli237.web_application_chat.model

import jakarta.persistence.*

@Entity
data class ChatRoom(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long,

    @Column(nullable = false)
    var name: String,

    @Enumerated(EnumType.STRING)
    var type: ChatRoomType = ChatRoomType.PRIVATE,

    @OneToMany(mappedBy = "chatRoom", cascade = [CascadeType.ALL])
    val participants: List<ChatParticipant> = mutableListOf(),

    @OneToMany(mappedBy = "chatRoom", cascade = [CascadeType.ALL])
    val messages: List<Message> = mutableListOf()

)

enum class ChatRoomType {
    PRIVATE, PUBLIC
}

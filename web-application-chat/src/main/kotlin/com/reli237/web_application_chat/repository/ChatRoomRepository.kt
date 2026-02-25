package com.reli237.web_application_chat.repository

import com.reli237.web_application_chat.model.ChatRoom
import com.reli237.web_application_chat.model.ChatRoomType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ChatRoomRepository: JpaRepository<ChatRoom, Long> {

    fun findByName(name: String): Optional<ChatRoom>

    fun findByType(type: ChatRoomType): List<ChatRoom>

    fun findByNameContainingIgnoreCase(name: String): List<ChatRoom>

}
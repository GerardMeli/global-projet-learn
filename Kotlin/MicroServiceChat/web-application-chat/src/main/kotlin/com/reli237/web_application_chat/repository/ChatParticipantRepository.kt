package com.reli237.web_application_chat.repository

import com.reli237.web_application_chat.model.ChatParticipant
import com.reli237.web_application_chat.model.ParticipantRole
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ChatParticipantRepository: JpaRepository<ChatParticipant, String> {

    fun findByUserId(userId: String): List<ChatParticipant>

    fun findByChatRoomId(chatRoomId: String): List<ChatParticipant>

    fun findByUserIdAndChatRoomId(userId: String, chatRoomId: String): Optional<ChatParticipant>

    fun findByRole(role: ParticipantRole): List<ChatParticipant>

    fun findByChatRoomIdAndRole(chatRoomId: String, role: ParticipantRole): List<ChatParticipant>

    fun countByChatRoomId(chatRoomId: String): Long

    fun countByUserId(userId: String): Long

    fun deleteByUserIdAndChatRoomId(userId: String, chatRoomId: String)

    fun existsByChatRoomIdAndUserId(chatRoomId: String, userId: String): Boolean
}
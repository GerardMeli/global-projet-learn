package com.reli237.web_application_chat.repository

import com.reli237.web_application_chat.model.ChatParticipant
import com.reli237.web_application_chat.model.ParticipantRole
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ChatParticipantRepository: JpaRepository<ChatParticipant, Long> {

    fun findByUserId(userId: Long): List<ChatParticipant>

    fun findByChatRoomId(chatRoomId: Long): List<ChatParticipant>

    fun findByUserIdAndChatRoomId(userId: Long, chatRoomId: Long): Optional<ChatParticipant>

    fun findByRole(role: ParticipantRole): List<ChatParticipant>

    fun findByChatRoomIdAndRole(chatRoomId: Long, role: ParticipantRole): List<ChatParticipant>

    fun countByChatRoomId(chatRoomId: Long): Long

    fun countByUserId(userId: Long): Long

    fun deleteByUserIdAndChatRoomId(userId: Long, chatRoomId: Long)

    fun existsByChatRoomIdAndUserId(chatRoomId: Long, userId: Long): Boolean
}
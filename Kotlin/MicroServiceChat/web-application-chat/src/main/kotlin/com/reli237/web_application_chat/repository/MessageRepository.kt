package com.reli237.web_application_chat.repository

import com.reli237.web_application_chat.model.ChatRoom
import com.reli237.web_application_chat.model.Message
import com.reli237.web_application_chat.model.MessageType
import com.reli237.web_application_chat.model.Users
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface MessageRepository: JpaRepository<Message, Long> {

    fun findByChatRoom(chatRoom: ChatRoom): List<Message>

    fun findByChatRoomIdOrderByTimeStampDesc(chatRoomId: Long): List<Message>

    fun findBySender(sender: Users): List<Message>

    fun findByIsDeletedFalse(): List<Message>

    fun findByChatRoomIdAndIsDeletedFalse(chatRoomId: Long): List<Message>

    fun countByChatRoomId(chatRoomId: Long): Long

    fun countBySenderId(senderId: Long): Long

    fun findByMessageType(messageType: MessageType): List<Message>

    @Query("""
        SELECT m FROM Message m 
        WHERE m.chatRoom.id = :chatRoomId 
        AND m.messageType IN :messageTypes
        AND m.isDeleted = false
    """)
    fun findByChatRoomIdAndMessageTypeIn(
        @Param("chatRoomId") chatRoomId: Long,
        @Param("messageTypes") messageTypes: List<MessageType>
    ): List<Message>

    fun findByChatRoomIdAndIsDeletedFalseOrderByTimeStampAsc(chatRoomId: Long): List<Message>
}
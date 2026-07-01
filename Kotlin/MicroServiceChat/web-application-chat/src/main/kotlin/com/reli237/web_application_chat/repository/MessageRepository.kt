package com.reli237.web_application_chat.repository

import com.reli237.web_application_chat.dto.UserDto
import com.reli237.web_application_chat.model.ChatRoom
import com.reli237.web_application_chat.model.Message
import com.reli237.web_application_chat.model.MessageType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface MessageRepository : JpaRepository<Message, String> {

    // Par chat room
    fun findByChatRoom(chatRoom: ChatRoom): List<Message>
    fun findByChatRoomIdOrderByTimeStampAsc(chatRoomId: String): List<Message>
    fun findByChatRoomIdAndIsDeletedFalse(chatRoomId: String): List<Message>
    fun countByChatRoomId(chatRoomId: String): Long

    // REMPLACEZ par :
    fun findBySenderId(senderId: String): List<Message>
    fun findBySenderIdAndIsDeletedFalse(senderId: String): List<Message>
    fun findBySenderIdOrderByTimeStampDesc(senderId: String): List<Message>
    fun countBySenderId(senderId: String): Long

    // Par type de message
    fun findByMessageType(messageType: MessageType): List<Message>
    fun findByChatRoomIdAndMessageTypeIn(chatRoomId: String, messageTypes: List<MessageType>): List<Message>

    // Messages non supprimés
    fun findByIsDeletedFalse(): List<Message>

    // Combinaisons utiles
    fun findByChatRoomIdAndSenderIdAndIsDeletedFalse(chatRoomId: String, senderId: String): List<Message>
}
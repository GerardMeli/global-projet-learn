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
interface MessageRepository : JpaRepository<Message, Long> {

    // Par chat room
    fun findByChatRoom(chatRoom: ChatRoom): List<Message>
    fun findByChatRoomId(chatRoomId: Long): List<Message>
    fun findByChatRoomIdOrderByTimeStampDesc(chatRoomId: Long): List<Message>
    fun findByChatRoomIdAndIsDeletedFalse(chatRoomId: Long): List<Message>
    fun countByChatRoomId(chatRoomId: Long): Long

    // Par sender (expéditeur) - CORRECTION ICI
    // SUPPRIMEZ cette ligne si elle existe:
    // fun findBySender(sender: UserDto.UserResponse): List<Message>

    // REMPLACEZ par:
    fun findBySenderId(senderId: Long): List<Message>
    fun findBySenderIdAndIsDeletedFalse(senderId: Long): List<Message>
    fun findBySenderIdOrderByTimeStampDesc(senderId: Long): List<Message>
    fun countBySenderId(senderId: Long): Long

    // Par type de message
    fun findByMessageType(messageType: MessageType): List<Message>
    fun findByChatRoomIdAndMessageTypeIn(chatRoomId: Long, messageTypes: List<MessageType>): List<Message>

    // Messages non supprimés
    fun findByIsDeletedFalse(): List<Message>

    // Combinaisons utiles
    fun findByChatRoomIdAndSenderIdAndIsDeletedFalse(chatRoomId: Long, senderId: Long): List<Message>
}
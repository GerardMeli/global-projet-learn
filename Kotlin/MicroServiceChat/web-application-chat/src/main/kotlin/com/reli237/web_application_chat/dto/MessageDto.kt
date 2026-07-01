package com.reli237.web_application_chat.dto

import com.reli237.web_application_chat.model.ChatRoom
import com.reli237.web_application_chat.model.MessageType
import java.time.LocalDateTime
import java.io.Serializable

class MessageDto {

    // Request DTOs
    data class MessageUpdateRequest(
        val content: String? = null
    )

    // Request DTOs
    data class MessageCreateRequest(
        val content: String,
        var chatRoomId: String,
        val messageType: MessageType = MessageType.TEXT
    )

    /**
     * Response for file messages in chat rooms
     */
    data class FileMessageResponse(
        val messageId: String,
        val fileId: String?,
        val fileName: String?,
        val originalFileName: String,
        val fileType: String,
        val fileSize: Long,
        val description: String,
        val uploaderId: String,
        val uploaderName: String,
        val chatRoomId: String,
        val chatRoomName: String,
        val timestamp: LocalDateTime,
        val uploadStatus: String
    )


    // Response DTOs
    data class MessageResponse(
        val id: String,
        val content: String,
        val sender: UserDto.UserSimpleResponse,
        val chatRoomId: String,
        val timestamp: LocalDateTime,
        val messageType: MessageType,
        val isDeleted: Boolean
    )

    data class MessageDetailResponse(
        val id: String,
        val content: String,
        val sender: UserDto.UserResponse,
        val chatRoom: ChatRoomDto.ChatRoomResponse,
        val timeStamp: LocalDateTime,
        val messageType: MessageType,
        val isDeleted: Boolean
    )

    /**
     * Request to notify that a user is typing
     */
    data class TypingRequest(
        val userId: String,
        val isTyping: Boolean
    ) : Serializable

    /**
     * Notification sent when a user is typing
     */
    data class TypingNotification(
        val userId: String,
        val isTyping: Boolean,
        val timestamp: Long = System.currentTimeMillis()
    ) : Serializable

    /**
     * Notification sent when a message is read
     */
    data class MessageReadNotification(
        val messageId: String,
        val readByUserId: String,
        val readAt: Long
    ) : Serializable

    /**
     * Event triggered when a user joins a chat room
     */
    data class UserJoinEvent(
        val userId: String,
        val username: String,
        val action: String,
        val timestamp: Long = System.currentTimeMillis()
    ) : Serializable

    /**
     * Response for typing status query
     */
    data class TypingStatusResponse(
        val roomId: String,
        val typingUsers: List<TypingUser>,
        val timestamp: Long = System.currentTimeMillis()
    ) : Serializable

    data class TypingUser(
        val userId: String,
        val username: String,
        val startedAt: Long
    ) : Serializable

    /**
     * Response for message read status
     */
    data class MessageReadStatusResponse(
        val messageId: String,
        val readBy: List<UserReadInfo>,
        val timestamp: Long = System.currentTimeMillis()
    ) : Serializable

    data class UserReadInfo(
        val userId: String,
        val username: String,
        val readAt: Long
    ) : Serializable


}
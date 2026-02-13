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
        var chatRoomId: Long,
        val messageType: MessageType = MessageType.TEXT
    )

    /**
     * Response for file messages in chat rooms
     */
    data class FileMessageResponse(
        val messageId: Long,
        val fileId: Long?,
        val fileName: String?,
        val originalFileName: String,
        val fileType: String,
        val fileSize: Long,
        val description: String,
        val uploaderId: Long,
        val uploaderName: String,
        val chatRoomId: Long,
        val chatRoomName: String,
        val timestamp: LocalDateTime,
        val uploadStatus: String
    )

    /**
     * Request to send a file to chat room
     */
    data class FileUploadRequest(
        val chatRoomId: Long,
        val description: String = ""
    )

    // Response DTOs
    data class MessageResponse(
        val id: Long,
        val content: String,
        val sender: UserDto.UserSimpleResponse,
        val chatRoomId: Long,
        val timestamp: LocalDateTime,
        val messageType: MessageType,
        val isDeleted: Boolean
    )

    data class MessageDetailResponse(
        val id: Long,
        val content: String,
        val sender: UserDto.UserResponse,
        val chatRoom: ChatRoom,
        val timeStamp: LocalDateTime,
        val messageType: MessageType,
        val isDeleted: Boolean
    )

    /**
     * Request to notify that a user is typing
     */
    data class TypingRequest(
        val userId: Long,
        val isTyping: Boolean
    ) : Serializable

    /**
     * Notification sent when a user is typing
     */
    data class TypingNotification(
        val userId: Long,
        val isTyping: Boolean,
        val timestamp: Long = System.currentTimeMillis()
    ) : Serializable

    /**
     * Notification sent when a message is read
     */
    data class MessageReadNotification(
        val messageId: Long,
        val readByUserId: Long,
        val readAt: Long
    ) : Serializable

    /**
     * Event triggered when a user joins a chat room
     */
    data class UserJoinEvent(
        val userId: Long,
        val username: String,
        val action: String,
        val timestamp: Long = System.currentTimeMillis()
    ) : Serializable

    /**
     * Response for typing status query
     */
    data class TypingStatusResponse(
        val roomId: Long,
        val typingUsers: List<TypingUser>,
        val timestamp: Long = System.currentTimeMillis()
    ) : Serializable

    data class TypingUser(
        val userId: Long,
        val username: String,
        val startedAt: Long
    ) : Serializable

    /**
     * Response for message read status
     */
    data class MessageReadStatusResponse(
        val messageId: Long,
        val readBy: List<UserReadInfo>,
        val timestamp: Long = System.currentTimeMillis()
    ) : Serializable

    data class UserReadInfo(
        val userId: Long,
        val username: String,
        val readAt: Long
    ) : Serializable


}
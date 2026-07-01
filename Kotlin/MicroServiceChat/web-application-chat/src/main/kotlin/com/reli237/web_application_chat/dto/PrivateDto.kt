package com.reli237.web_application_chat.dto

import java.time.LocalDateTime

class PrivateDto {

    data class PrivateChatRequest(
        val senderId2: String,
        val content: String
    )

    data class PrivateChatResponse(
        val id: String,
        val senderId1: String,
        val senderId2: String,
        val senderName1: String,
        val senderName2: String,
        val content: String,
        val timestamp: LocalDateTime,
        val isRead: Boolean
    )

    data class MarkAsReadRequest(
        val messageIds: List<String>
    )

    /**
     * Response for file messages in private chats
     */
    data class PrivateFileResponse(
        val messageId: String,
        val fileId: String?,
        val fileName: String?,
        val originalFileName: String,
        val fileType: String,
        val fileSize: Long,
        val description: String,
        val senderId: String,
        val senderName: String,
        val receiverId: String,
        val receiverName: String,
        val timestamp: LocalDateTime,
        val uploadStatus: String,
        val downloadUrl: String
    )

    /**
     * Request to send a file in private chat
     */
    data class PrivateFileRequest(
        val receiverId: String,
        val description: String = ""
    )

}
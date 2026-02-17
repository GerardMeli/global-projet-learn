package com.reli237.web_application_chat.service

import com.reli237.web_application_chat.dto.PrivateDto
import com.reli237.web_application_chat.dto.UserDto
import com.reli237.web_application_chat.feign.FileWebChatInterface
import com.reli237.web_application_chat.feign.UsersWebChatInterface
import com.reli237.web_application_chat.model.PrivateChat
import com.reli237.web_application_chat.repository.PrivateChatRepository
import org.springframework.http.ResponseEntity
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime

@Service
class PrivateChatService(
    private val privateChatRepository: PrivateChatRepository,
    private val usersWebChatInterface: UsersWebChatInterface,
    private val messagingTemplate: SimpMessagingTemplate,
    private val fileWebChatInterface: FileWebChatInterface
) {

    companion object {
        private const val FILE_UPLOAD_SUCCESS = "File uploaded successfully"
        private const val FILE_UPLOAD_FAILED = "Failed to upload file"
    }

    // ===== FONCTION D'EXTENSION POUR FEIGN CLIENT =====
    private fun <T> ResponseEntity<T>.getBodyOrThrow(errorMessage: String): T {
        if (!this.statusCode.is2xxSuccessful || this.body == null) {
            throw IllegalArgumentException(errorMessage)
        }
        return this.body!!
    }

    /**
     * Send a text message in private chat
     */
    @Transactional
    fun sendMessage(senderId: Long, request: PrivateDto.PrivateChatRequest): PrivateDto.PrivateChatResponse {
        // Validate sender is not sending to themselves
        if (senderId == request.senderId2) {
            throw IllegalArgumentException("Cannot send message to yourself")
        }

        // Vérifier que les utilisateurs existent
        val sender = usersWebChatInterface.getUserBasicInfo(senderId)
            .getBodyOrThrow("Sender not found")

        val receiver = usersWebChatInterface.getUserBasicInfo(request.senderId2)
            .getBodyOrThrow("Receiver not found")

        // CORRECTION: Utilisez les IDs au lieu des entités
        val chatMessage = PrivateChat(
            senderId1 = senderId,
            senderId2 = request.senderId2,
            content = request.content.trim()
        )

        val savedMessage = privateChatRepository.save(chatMessage)
        val response = convertToResponse(savedMessage)

        // Send WebSocket notifications
        sendMessageNotifications(savedMessage, sender, receiver)

        return response
    }

    fun getChatBetweenUserResponse(userId1: Long, userId2: Long): List<PrivateDto.PrivateChatResponse> {
        val messages = privateChatRepository.findChatBetweenUsers(userId1, userId2)
        return messages.map { convertToResponse(it) }
    }

    fun getAllPrivateChats(): List<PrivateDto.PrivateChatResponse> {
        return privateChatRepository.findAll()
            .map { convertToResponse(it) }
    }

    fun getUserChats(userId: Long): List<PrivateDto.PrivateChatResponse> {
        val messages = privateChatRepository.findUserChats(userId)
        return messages.map { convertToResponse(it) }
    }

    fun getUserContacts(userId: Long): List<UserContactDTO> {
        // Récupérer les IDs des contacts
        val contactIds = privateChatRepository.findUserContactIds(userId)

        return contactIds.map { contactId ->
            // Récupérer les infos du contact via Feign
            val contact = usersWebChatInterface.getUserBasicInfo(contactId)
                .getBodyOrThrow("User not found with id: $contactId")

            val lastMessage = privateChatRepository
                .findChatBetweenUsers(userId, contactId)
                .lastOrNull()

            UserContactDTO(
                userId = contact.id,
                username = contact.email,
                lastMessage = lastMessage?.content ?: "",
                lastMessageTime = lastMessage?.timestamp,
                unreadCount = privateChatRepository
                    .findChatBetweenUsers(userId, contactId)
                    .count { it.senderId2 == userId && !it.isRead }
            )
        }
    }

    @Transactional
    fun markMessagesAsRead(userId: Long, request: PrivateDto.MarkAsReadRequest) {
        val updatedCount = privateChatRepository.markMessagesAsRead(request.messageIds, userId)

        if (updatedCount > 0) {
            // Notify sender that messages have been read
            val messages = privateChatRepository.findMessagesByIdsAndUser(request.messageIds, userId)
            messages.firstOrNull()?.let { firstMessage ->
                val senderId = firstMessage.senderId1
                messagingTemplate.convertAndSend(
                    "/topic/private/read/${senderId}",
                    MessagesReadNotification(
                        messageIds = request.messageIds,
                        readerId = userId
                    )
                )
            }
        }
    }

    /**
     * Send a file in private chat
     */
    @Transactional
    fun sendFile(
        senderId: Long,
        receiverId: Long,
        file: MultipartFile,
        description: String = ""
    ): PrivateDto.PrivateFileResponse {
        println("📁 ===== SEND FILE IN PRIVATE CHAT START =====")
        println("📁 Sender ID: $senderId")
        println("📁 Receiver ID: $receiverId")
        println("📁 File Name: ${file.originalFilename}")
        println("📁 File Size: ${file.size} bytes")

        // Validate sender is not sending to themselves
        if (senderId == receiverId) {
            throw IllegalArgumentException("Cannot send file to yourself")
        }

        // Validate users exist
        val sender = usersWebChatInterface.getUserBasicInfo(senderId)
            .getBodyOrThrow("Sender not found")

        val receiver = usersWebChatInterface.getUserBasicInfo(receiverId)
            .getBodyOrThrow("Receiver not found")

        try {
            // Upload file to file service
            println("📤 Uploading file to file service...")
            val uploadResponse = fileWebChatInterface.uploadFile(file, description)

            if (uploadResponse.statusCode.is2xxSuccessful) {
                val responseBody = uploadResponse.body ?: emptyMap()
                val fileName = responseBody["fileName"]?.toString() ?: file.originalFilename
                val fileId = responseBody["id"]?.toString()?.toLongOrNull()

                println("✅ File uploaded successfully: $fileName")

                // Create private chat message for the file
                val fileMessageContent = if (description.isNotBlank()) {
                    "📎 File: $fileName - $description"
                } else {
                    "📎 File: $fileName"
                }

                // CORRECTION: Utilisez les IDs au lieu des entités
                val chatMessage = PrivateChat(
                    senderId1 = senderId,
                    senderId2 = receiverId,
                    content = fileMessageContent
                )

                val savedMessage = privateChatRepository.save(chatMessage)
                println("✅ File message saved with ID: ${savedMessage.id}")

                // Create response
                val response = PrivateDto.PrivateFileResponse(
                    messageId = savedMessage.id,
                    fileId = fileId,
                    fileName = fileName,
                    originalFileName = file.originalFilename ?: "unknown",
                    fileType = file.contentType ?: "application/octet-stream",
                    fileSize = file.size,
                    description = description,
                    senderId = sender.id,
                    senderName = sender.email,
                    receiverId = receiver.id,
                    receiverName = receiver.email,
                    timestamp = savedMessage.timestamp,
                    uploadStatus = FILE_UPLOAD_SUCCESS,
                    downloadUrl = generateDownloadUrl(fileName)
                )

                // Send WebSocket notifications for file
                sendFileNotifications(savedMessage, sender, receiver, response)

                return response
            } else {
                println("❌ File upload failed with status: ${uploadResponse.statusCode}")
                throw IllegalStateException("File upload failed: ${uploadResponse.statusCode}")
            }
        } catch (e: Exception) {
            println("❌ Error uploading file: ${e.message}")
            throw IllegalStateException("Failed to upload file: ${e.message}", e)
        } finally {
            println("📁 ===== SEND FILE IN PRIVATE CHAT END =====")
        }
    }

    /**
     * Get all files exchanged between two users
     */
    fun getFilesBetweenUsers(userId1: Long, userId2: Long): List<PrivateDto.PrivateFileResponse> {
        val messages = privateChatRepository.findChatBetweenUsers(userId1, userId2)
            .filter { isFileMessage(it.content) }

        return messages.map { message ->
            // Récupérer les infos des utilisateurs
            val sender = usersWebChatInterface.getUserBasicInfo(message.senderId1)
                .getBodyOrThrow("User not found with id: ${message.senderId1}")
            val receiver = usersWebChatInterface.getUserBasicInfo(message.senderId2)
                .getBodyOrThrow("User not found with id: ${message.senderId2}")

            PrivateDto.PrivateFileResponse(
                messageId = message.id,
                fileId = extractFileIdFromContent(message.content),
                fileName = extractFileNameFromContent(message.content),
                originalFileName = extractFileNameFromContent(message.content),
                fileType = extractFileTypeFromContent(message.content),
                fileSize = 0L,
                description = extractDescriptionFromContent(message.content),
                senderId = sender.id,
                senderName = sender.email,
                receiverId = receiver.id,
                receiverName = receiver.email,
                timestamp = message.timestamp,
                uploadStatus = "Stored",
                downloadUrl = generateDownloadUrl(extractFileNameFromContent(message.content))
            )
        }
    }

    /**
     * Delete a file message (soft delete)
     */
    @Transactional
    fun deleteFileMessage(messageId: Long): PrivateDto.PrivateFileResponse {
        val message = privateChatRepository.findById(messageId)
            .orElseThrow { throw IllegalArgumentException("Message not found with id: $messageId") }

        if (!isFileMessage(message.content)) {
            throw IllegalArgumentException("Message is not a file message")
        }

        // Soft delete by marking as deleted (if you have an isDeleted field)
        // For now, we'll just return the response
        // val deletedMessage = message.copy(isDeleted = true)
        // privateChatRepository.save(deletedMessage)

        // Récupérer les infos des utilisateurs
        val sender = usersWebChatInterface.getUserBasicInfo(message.senderId1)
            .getBodyOrThrow("User not found with id: ${message.senderId1}")
        val receiver = usersWebChatInterface.getUserBasicInfo(message.senderId2)
            .getBodyOrThrow("User not found with id: ${message.senderId2}")

        return PrivateDto.PrivateFileResponse(
            messageId = message.id,
            fileId = null,
            fileName = extractFileNameFromContent(message.content),
            originalFileName = extractFileNameFromContent(message.content),
            fileType = extractFileTypeFromContent(message.content),
            fileSize = 0L,
            description = "Deleted: ${extractDescriptionFromContent(message.content)}",
            senderId = sender.id,
            senderName = sender.email,
            receiverId = receiver.id,
            receiverName = receiver.email,
            timestamp = message.timestamp,
            uploadStatus = "Deleted",
            downloadUrl = ""
        )
    }

    /**
     * Send WebSocket notifications for a text message
     */
    private fun sendMessageNotifications(
        message: PrivateChat,
        sender: UserDto.UserResponse,
        receiver: UserDto.UserResponse
    ) {
        println("Sending WebSocket notifications:")
        println("- From: ${sender.id} (${sender.email})")
        println("- To: ${receiver.id} (${receiver.email})")
        println("- Content: ${message.content}")

        // Notify receiver
        messagingTemplate.convertAndSend(
            "/topic/private/${receiver.id}",
            PrivateChatNotification(
                messageId = message.id,
                senderId = sender.id,
                senderName = sender.email,
                content = message.content,
                timestamp = message.timestamp,
                unreadCount = getUnreadCount(receiver.id),
                isOwnMessage = false,
                isFile = false
            )
        )

        // Notify sender
        messagingTemplate.convertAndSend(
            "/topic/private/${sender.id}",
            PrivateChatNotification(
                messageId = message.id,
                senderId = sender.id,
                senderName = sender.email,
                content = message.content,
                timestamp = message.timestamp,
                unreadCount = getUnreadCount(sender.id),
                isOwnMessage = true,
                isFile = false
            )
        )
    }

    /**
     * Send WebSocket notifications for a file message
     */
    private fun sendFileNotifications(
        message: PrivateChat,
        sender: UserDto.UserResponse,
        receiver: UserDto.UserResponse,
        fileResponse: PrivateDto.PrivateFileResponse
    ) {
        println("Sending WebSocket file notifications:")
        println("- File: ${fileResponse.fileName}")
        println("- To receiver: ${receiver.id} (${receiver.email})")
        println("- To sender: ${sender.id} (${sender.email})")

        // Notify receiver
        messagingTemplate.convertAndSend(
            "/topic/private/file/${receiver.id}",
            PrivateFileNotification(
                messageId = message.id,
                senderId = sender.id,
                senderName = sender.email,
                fileName = fileResponse.fileName,
                fileType = fileResponse.fileType,
                fileSize = fileResponse.fileSize,
                description = fileResponse.description,
                timestamp = message.timestamp,
                downloadUrl = fileResponse.downloadUrl,
                isOwnMessage = false
            )
        )

        // Notify sender
        messagingTemplate.convertAndSend(
            "/topic/private/file/${sender.id}",
            PrivateFileNotification(
                messageId = message.id,
                senderId = sender.id,
                senderName = sender.email,
                fileName = fileResponse.fileName,
                fileType = fileResponse.fileType,
                fileSize = fileResponse.fileSize,
                description = fileResponse.description,
                timestamp = message.timestamp,
                downloadUrl = fileResponse.downloadUrl,
                isOwnMessage = true
            )
        )
    }

    /**
     * Generate download URL for a file
     */
    private fun generateDownloadUrl(fileName: String?): String {
        return "/api/files/download/$fileName"
    }

    /**
     * Check if message content indicates a file
     */
    private fun isFileMessage(content: String): Boolean {
        return content.contains("📎 File:") || content.startsWith("File:")
    }

    /**
     * Extract file name from message content
     */
    private fun extractFileNameFromContent(content: String): String {
        return when {
            content.contains("📎 File:") -> {
                val afterEmoji = content.substringAfter("📎 File: ")
                afterEmoji.substringBefore(" - ")
            }
            content.contains("File:") -> {
                content.substringAfter("File: ").trim()
            }
            else -> content
        }
    }

    /**
     * Extract file ID from message content (if stored)
     */
    private fun extractFileIdFromContent(content: String): Long? {
        // In a real implementation, you might store the file ID in the content or metadata
        return null
    }

    /**
     * Extract file type from message content
     */
    private fun extractFileTypeFromContent(content: String): String {
        val fileName = extractFileNameFromContent(content)
        return when {
            fileName.matches(Regex(".*\\.(jpg|jpeg|png|gif|bmp|webp)$", RegexOption.IGNORE_CASE)) -> "image/*"
            fileName.matches(Regex(".*\\.(pdf)$", RegexOption.IGNORE_CASE)) -> "application/pdf"
            fileName.matches(Regex(".*\\.(doc|docx)$", RegexOption.IGNORE_CASE)) -> "application/msword"
            fileName.matches(Regex(".*\\.(xls|xlsx)$", RegexOption.IGNORE_CASE)) -> "application/vnd.ms-excel"
            else -> "application/octet-stream"
        }
    }

    /**
     * Extract description from message content
     */
    private fun extractDescriptionFromContent(content: String): String {
        return if (content.contains(" - ")) {
            content.substringAfter(" - ")
        } else {
            ""
        }
    }

    fun getUnreadCount(userId: Long): Long {
        return privateChatRepository.countUnreadMessages(userId)
    }

    /**
     * Convert PrivateChat entity to PrivateChatResponse DTO
     */
    private fun convertToResponse(chat: PrivateChat): PrivateDto.PrivateChatResponse {
        // Récupérer les infos des utilisateurs via Feign
        val sender = usersWebChatInterface.getUserBasicInfo(chat.senderId1)
            .getBodyOrThrow("User not found with id: ${chat.senderId1}")
        val receiver = usersWebChatInterface.getUserBasicInfo(chat.senderId2)
            .getBodyOrThrow("User not found with id: ${chat.senderId2}")

        return PrivateDto.PrivateChatResponse(
            id = chat.id,
            senderId1 = chat.senderId1,
            senderId2 = chat.senderId2,
            senderName1 = sender.email,
            senderName2 = receiver.email,
            content = chat.content,
            timestamp = chat.timestamp,
            isRead = chat.isRead
        )
    }

    // DTOs pour les notifications WebSocket
    data class MessagesReadNotification(
        val messageIds: List<Long>,
        val readerId: Long
    )

    // DTOs for WebSocket notifications
    data class PrivateChatNotification(
        val messageId: Long,
        val senderId: Long,
        val senderName: String,
        val content: String,
        val timestamp: LocalDateTime,
        val unreadCount: Long = 0,
        val isOwnMessage: Boolean = false,
        val isFile: Boolean = false
    )

    data class PrivateFileNotification(
        val messageId: Long,
        val senderId: Long,
        val senderName: String,
        val fileName: String?,
        val fileType: String,
        val fileSize: Long,
        val description: String,
        val timestamp: LocalDateTime,
        val downloadUrl: String,
        val isOwnMessage: Boolean = false
    )

    data class UserContactDTO(
        val userId: Long,
        val username: String,
        val lastMessage: String,
        val lastMessageTime: LocalDateTime?,
        val unreadCount: Int
    )
}
package com.reli237.web_application_chat.service

import com.reli237.web_application_chat.dto.PrivateDto
import com.reli237.web_application_chat.feign.WebChatInterface
import com.reli237.web_application_chat.model.PrivateChat
import com.reli237.web_application_chat.model.Users
import com.reli237.web_application_chat.repository.PrivateChatRepository
import com.reli237.web_application_chat.repository.UsersRepository
import org.springframework.http.ResponseEntity
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime

@Service
class PrivateChatService(
    private val privateChatRepository: PrivateChatRepository,
    private val usersRepository: UsersRepository,
    private val messagingTemplate: SimpMessagingTemplate,
    private val webChatInterface: WebChatInterface

) {

    companion object {
        private const val FILE_UPLOAD_SUCCESS = "File uploaded successfully"
        private const val FILE_UPLOAD_FAILED = "Failed to upload file"
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

        val sender = usersRepository.findById(senderId)
            .orElseThrow { IllegalArgumentException("Sender not found") }

        val receiver = usersRepository.findById(request.senderId2)
            .orElseThrow { IllegalArgumentException("Receiver not found") }

        val chatMessage = PrivateChat(
            senderId1 = sender,
            senderId2 = receiver,
            content = request.content.trim()
        )

        val savedMessage = privateChatRepository.save(chatMessage)
        val response = convertToResponse(savedMessage)

        // Send WebSocket notifications
        sendMessageNotifications(savedMessage, sender, receiver)

        return response
    }

//    @Transactional
//    fun sendMessage(senderId: Long, request: PrivateDto.PrivateChatRequest): PrivateDto.PrivateChatResponse {
//        // Vérifiez que l'expéditeur n'envoie pas à lui-même
//        if (senderId == request.senderId2) {
//            throw IllegalArgumentException("Cannot send message to yourself")
//        }
//
//        val sender = usersRepository.findById(senderId)
//            .orElseThrow { IllegalArgumentException("Sender not found") }
//
//        val receiver = usersRepository.findById(request.senderId2)
//            .orElseThrow { IllegalArgumentException("Receiver not found") }
//
//        val chatMessage = PrivateChat(
//            senderId1 = sender,
//            senderId2 = receiver,
//            content = request.content.trim()
//        )
//
//        val savedMessage = privateChatRepository.save(chatMessage)
//
//        // Convert to response DTO
//        val response = convertToResponse(savedMessage)
//
//        // **AJOUTEZ DES LOGS pour déboguer**
//        println("Sending WebSocket notifications:")
//        println("- To receiver: ${receiver.id} (${receiver.email})")
//        println("- To sender: ${sender.id} (${sender.email})")
//
//        // **NOTIFIEZ LE DESTINATAIRE SEULEMENT**
//        messagingTemplate.convertAndSend(
//            "/topic/private/${receiver.id}",
//            PrivateChatNotification(
//                messageId = savedMessage.id,
//                senderId = sender.id,
//                senderName = sender.email,
//                content = savedMessage.content,
//                timestamp = savedMessage.timestamp,
//                unreadCount = getUnreadCount(receiver.id),
//                isOwnMessage = false  // Pour le destinataire
//            )
//        )
//
//        // **NOTIFIEZ L'EXPÉDITEUR (optionnel, mais avec un flag différent)**
//        messagingTemplate.convertAndSend(
//            "/topic/private/${sender.id}",
//            PrivateChatNotification(
//                messageId = savedMessage.id,
//                senderId = sender.id,
//                senderName = sender.email,
//                content = savedMessage.content,
//                timestamp = savedMessage.timestamp,
//                unreadCount = getUnreadCount(sender.id),
//                isOwnMessage = true  // Pour l'expéditeur
//            )
//        )
//
//        return response
//    }

    fun getChatBetweenUsers(userId1: Long, userId2: Long): List<PrivateDto.PrivateChatResponse> {
        val messages = privateChatRepository.findChatBetweenUsers(userId1, userId2)
        return messages.map { convertToResponse(it) }
    }

    fun getAllPrivateChats(): List<PrivateDto.PrivateChatResponse> {
        return privateChatRepository.findAll()
            .map { convertToResponseChat(it) }
    }

    private fun convertToResponseChat(chat: PrivateChat): PrivateDto.PrivateChatResponse {
        return PrivateDto.PrivateChatResponse(
            id = chat.id,
            senderId1 = chat.senderId1.id,
            senderId2 = chat.senderId2.id,
            senderName1 = chat.senderId1.email,
            senderName2 = chat.senderId2.email,
            content = chat.content,
            timestamp = chat.timestamp,
            isRead = chat.isRead
        )
    }


    fun getUserChats(userId: Long): List<PrivateDto.PrivateChatResponse> {
        val messages = privateChatRepository.findUserChats(userId)
        return messages.map { convertToResponse(it) }
    }

    fun getUserContacts(userId: Long): List<UserContactDTO> {
        val contacts = privateChatRepository.findUserContacts(userId)
        return contacts.map { contact ->
            val lastMessage = privateChatRepository
                .findChatBetweenUsers(userId, contact.id)
                .lastOrNull()

            UserContactDTO(
                userId = contact.id,
                username = contact.email,
                lastMessage = lastMessage?.content ?: "",
                lastMessageTime = lastMessage?.timestamp,
                unreadCount = privateChatRepository
                    .findChatBetweenUsers(userId, contact.id)
                    .count { it.senderId2.id == userId && !it.isRead }
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
                val senderId = firstMessage.senderId1.id
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
        val sender = usersRepository.findById(senderId)
            .orElseThrow { IllegalArgumentException("Sender not found") }

        val receiver = usersRepository.findById(receiverId)
            .orElseThrow { IllegalArgumentException("Receiver not found") }

        try {
            // Upload file to file service
            println("📤 Uploading file to file service...")
            val uploadResponse = webChatInterface.uploadFile(file, description)

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

                val chatMessage = PrivateChat(
                    senderId1 = sender,
                    senderId2 = receiver,
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
     * Get all files shared between two users
     */
    fun getFilesBetweenUsers(userId1: Long, userId2: Long): List<PrivateDto.PrivateFileResponse> {
        val messages = privateChatRepository.findChatBetweenUsers(userId1, userId2)

        return messages.filter { isFileMessage(it.content) }.map { message ->
            PrivateDto.PrivateFileResponse(
                messageId = message.id,
                fileId = extractFileIdFromContent(message.content),
                fileName = extractFileNameFromContent(message.content),
                originalFileName = extractFileNameFromContent(message.content),
                fileType = extractFileTypeFromContent(message.content),
                fileSize = 0L, // Would need to be stored separately or fetched from file service
                description = extractDescriptionFromContent(message.content),
                senderId = message.senderId1.id,
                senderName = message.senderId1.email,
                receiverId = message.senderId2.id,
                receiverName = message.senderId2.email,
                timestamp = message.timestamp,
                uploadStatus = "Stored",
                downloadUrl = generateDownloadUrl(extractFileNameFromContent(message.content))
            )
        }
    }

    /**
     * Get file download URL
     */
    fun getFileDownloadUrlForPrivateChat(fileName: String): String {
        return generateDownloadUrl(fileName)
    }


    /**
     * Delete a file message (soft delete by updating content)
     */
    @Transactional
    fun deleteFileMessage(messageId: Long, userId: Long): PrivateDto.PrivateFileResponse {
        val message = privateChatRepository.findById(messageId)
            .orElseThrow { IllegalArgumentException("Message not found") }

        // Check if user is sender or receiver
        if (message.senderId1.id != userId && message.senderId2.id != userId) {
            throw IllegalArgumentException("You can only delete your own messages")
        }

        if (!isFileMessage(message.content)) {
            throw IllegalArgumentException("Message is not a file message")
        }

        // Mark as deleted in content
        val originalContent = message.content
        message.content = "🗑️ Deleted: ${extractFileNameFromContent(originalContent)}"

        val updatedMessage = privateChatRepository.save(message)

        return PrivateDto.PrivateFileResponse(
            messageId = updatedMessage.id,
            fileId = extractFileIdFromContent(originalContent),
            fileName = extractFileNameFromContent(originalContent),
            originalFileName = extractFileNameFromContent(originalContent),
            fileType = extractFileTypeFromContent(originalContent),
            fileSize = 0L,
            description = "Deleted file",
            senderId = updatedMessage.senderId1.id,
            senderName = updatedMessage.senderId1.email,
            receiverId = updatedMessage.senderId2.id,
            receiverName = updatedMessage.senderId2.email,
            timestamp = updatedMessage.timestamp,
            uploadStatus = "Deleted",
            downloadUrl = ""
        )
    }


    /**
     * Send WebSocket notifications for a text message
     */
    private fun sendMessageNotifications(
        message: PrivateChat,
        sender: Users,
        receiver: Users
    ) {
        println("Sending WebSocket notifications:")
        println("- To receiver: ${receiver.id} (${receiver.email})")
        println("- To sender: ${sender.id} (${sender.email})")

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
        sender: Users,
        receiver: Users,
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

    private fun convertToResponse(chat: PrivateChat): PrivateDto.PrivateChatResponse {
        return PrivateDto.PrivateChatResponse(
            id = chat.id,
            senderId1 = chat.senderId1.id,
            senderId2 = chat.senderId2.id,
            senderName1 = chat.senderId1.email,
            senderName2 = chat.senderId2.email,
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
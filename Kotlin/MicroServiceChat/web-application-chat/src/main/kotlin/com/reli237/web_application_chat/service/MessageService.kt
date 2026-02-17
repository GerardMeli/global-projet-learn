package com.reli237.web_application_chat.service

import com.reli237.web_application_chat.dto.MessageDto
import com.reli237.web_application_chat.dto.UserDto
import com.reli237.web_application_chat.feign.FileWebChatInterface
import com.reli237.web_application_chat.feign.UsersWebChatInterface
import com.reli237.web_application_chat.model.ChatRoom
import com.reli237.web_application_chat.model.Message
import com.reli237.web_application_chat.model.MessageType
import com.reli237.web_application_chat.repository.ChatRoomRepository
import com.reli237.web_application_chat.repository.MessageRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime

@Service
@Transactional
class MessageService(
    private val messageRepository: MessageRepository,
    private val chatRoomRepository: ChatRoomRepository,
    private val usersWebChatInterface: UsersWebChatInterface,
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
     * Create a new message in a chat room
     */
    @Transactional
    fun createMessage(userId: Long, request: MessageDto.MessageCreateRequest): MessageDto.MessageResponse {
        println("📝 ===== CREATE MESSAGE START =====")
        println("📝 User ID: $userId")
        println("📝 Room ID: ${request.chatRoomId}")
        println("📝 Content: ${request.content}")

        // Vérifier que l'utilisateur existe
        val user = usersWebChatInterface.getUserBasicInfo(userId)
            .getBodyOrThrow("User not found with id: $userId")
        println("✅ User found: ${user.email}")

        val chatRoom = chatRoomRepository.findById(request.chatRoomId).orElseThrow {
            println("❌ Chat room ${request.chatRoomId} not found")
            throw EntityNotFoundException("Chat room not found with id: ${request.chatRoomId}")
        }
        println("✅ Chat room found: ${chatRoom.name}")

        // CORRECTION: Utilisez senderId au lieu de sender
        val message = Message(
            id = 0,
            content = request.content,
            senderId = userId,  // ← Changé ici
            chatRoom = chatRoom,
            timeStamp = LocalDateTime.now(),
            messageType = MessageType.TEXT,
            isDeleted = false
        )

        val savedMessage = messageRepository.save(message)
        println("✅ Message saved with ID: ${savedMessage.id}")
        println("📝 ===== CREATE MESSAGE END =====")

        return MessageDto.MessageResponse(
            id = savedMessage.id,
            content = savedMessage.content,
            sender = UserDto.UserSimpleResponse(
                id = user.id,
                email = user.email
            ),
            chatRoomId = savedMessage.chatRoom.id,
            timestamp = savedMessage.timeStamp,
            messageType = savedMessage.messageType,
            isDeleted = savedMessage.isDeleted
        )
    }

    /**
     * Get all messages in a chat room
     */
    fun getMessagesByChatRoom(chatRoomId: Long): List<MessageDto.MessageResponse> {
        val chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with id: $chatRoomId") }

        return messageRepository.findByChatRoom(chatRoom)
            .filter { !it.isDeleted }
            .map { mapToMessageResponse(it) }
    }

    /**
     * Get all messages in a chat room ordered by timestamp (newest first)
     */
    fun getMessagesByChatRoomOrdered(chatRoomId: Long): List<MessageDto.MessageResponse> {
        return messageRepository.findByChatRoomIdOrderByTimeStampDesc(chatRoomId)
            .filter { !it.isDeleted }
            .map { mapToMessageResponse(it) }
    }

    /**
     * Get all messages sent by a specific user
     */
    fun getMessagesBySender(senderId: Long): List<MessageDto.MessageResponse> {
        // Vérifier que l'utilisateur existe
        val sender = usersWebChatInterface.getUserBasicInfo(senderId)
            .getBodyOrThrow("User not found with id: $senderId")

        return messageRepository.findBySenderId(senderId)
            .filter { !it.isDeleted }
            .map { mapToMessageResponse(it) }
    }

    /**
     * Get all non-deleted messages
     */
    fun getAllActiveMessages(): List<MessageDto.MessageResponse> {
        return messageRepository.findByIsDeletedFalse()
            .map { mapToMessageResponse(it) }
    }

    /**
     * Get all active messages in a chat room
     */
    fun getActiveMessagesByChatRoom(chatRoomId: Long): List<MessageDto.MessageResponse> {
        return messageRepository.findByChatRoomIdAndIsDeletedFalse(chatRoomId)
            .map { mapToMessageResponse(it) }
    }

    /**
     * Get messages by type
     */
    fun getMessagesByType(messageType: MessageType): List<MessageDto.MessageResponse> {
        return messageRepository.findByMessageType(messageType)
            .filter { !it.isDeleted }
            .map { mapToMessageResponse(it) }
    }

    /**
     * Update message content
     */
    fun updateMessage(messageId: Long, request: MessageDto.MessageUpdateRequest): MessageDto.MessageResponse {
        val message = messageRepository.findById(messageId)
            .orElseThrow { throw IllegalArgumentException("Message not found with id: $messageId") }

        if (message.isDeleted) {
            throw IllegalStateException("Cannot update a deleted message")
        }

        if (!request.content.isNullOrBlank()) {
            // Create a new message with updated content (since Message is a data class)
            val updatedMessage = message.copy(content = request.content)
            val saved = messageRepository.save(updatedMessage)
            return mapToMessageResponse(saved)
        }

        return mapToMessageResponse(message)
    }

    /**
     * Soft delete a message
     */
    fun deleteMessage(messageId: Long): MessageDto.MessageResponse {
        val message = messageRepository.findById(messageId)
            .orElseThrow { throw IllegalArgumentException("Message not found with id: $messageId") }

        val deletedMessage = message.copy(isDeleted = true)
        val saved = messageRepository.save(deletedMessage)
        return mapToMessageResponse(saved)
    }

    /**
     * Restore a deleted message
     */
    fun restoreMessage(messageId: Long): MessageDto.MessageResponse {
        val message = messageRepository.findById(messageId)
            .orElseThrow { throw IllegalArgumentException("Message not found with id: $messageId") }

        if (!message.isDeleted) {
            throw IllegalStateException("Message is not deleted")
        }

        val restoredMessage = message.copy(isDeleted = false)
        val saved = messageRepository.save(restoredMessage)
        return mapToMessageResponse(saved)
    }

    /**
     * Permanently delete a message (hard delete)
     */
    fun permanentlyDeleteMessage(messageId: Long) {
        if (!messageRepository.existsById(messageId)) {
            throw IllegalArgumentException("Message not found with id: $messageId")
        }
        messageRepository.deleteById(messageId)
    }

    /**
     * Count total messages in a chat room
     */
    fun countMessagesByChatRoom(chatRoomId: Long): Long {
        return messageRepository.countByChatRoomId(chatRoomId)
    }

    /**
     * Count total messages sent by a user
     */
    fun countMessagesBySender(senderId: Long): Long {
        return messageRepository.countBySenderId(senderId)
    }

    /**
     * Get all messages (including deleted)
     */
    fun getAllMessages(): List<MessageDto.MessageResponse> {
        return messageRepository.findAll()
            .map { mapToMessageResponse(it) }
    }

    /**
     * Get file download URL for a file message
     */
    fun getFileDownloadUrl(fileName: String): String {
        // In a real implementation, this would generate a secure download URL
        return "/api/files/download/$fileName"
    }

    /**
     * Alternative method using chat room ID directly
     */
    fun getChatRoomFilesAlternative(chatRoomId: Long): List<MessageDto.FileMessageResponse> {
        // Use the query-based method
        val fileMessages = messageRepository.findByChatRoomIdAndMessageTypeIn(
            chatRoomId,
            listOf(MessageType.FILE, MessageType.IMAGE)
        )

        val chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow {
            throw EntityNotFoundException("Chat room not found with id: $chatRoomId")
        }

        return fileMessages.map { message ->
            // Récupérer les infos de l'uploader
            val uploader = usersWebChatInterface.getUserBasicInfo(message.senderId)
                .getBodyOrThrow("User not found with id: ${message.senderId}")

            MessageDto.FileMessageResponse(
                messageId = message.id,
                fileId = extractFileIdFromContent(message.content),
                fileName = extractFileNameFromContent(message.content),
                originalFileName = extractFileNameFromContent(message.content),
                fileType = getFileTypeFromMessage(message),
                fileSize = extractFileSizeFromContent(message.content),
                description = extractDescriptionFromContent(message.content),
                uploaderId = uploader.id,
                uploaderName = uploader.email,
                chatRoomId = chatRoom.id,
                chatRoomName = chatRoom.name,
                timestamp = message.timeStamp,
                uploadStatus = "Stored"
            )
        }
    }

    /**
     * Delete a file message (soft delete)
     */
    @Transactional
    fun deleteFileMessage(messageId: Long): MessageDto.FileMessageResponse {
        val message = messageRepository.findById(messageId)
            .orElseThrow { throw IllegalArgumentException("Message not found with id: $messageId") }

        if (message.messageType != MessageType.FILE && message.messageType != MessageType.IMAGE) {
            throw IllegalArgumentException("Message is not a file message")
        }

        val deletedMessage = message.copy(isDeleted = true)
        val saved = messageRepository.save(deletedMessage)

        // Récupérer les infos de l'uploader
        val uploader = usersWebChatInterface.getUserBasicInfo(saved.senderId)
            .getBodyOrThrow("User not found with id: ${saved.senderId}")

        // Extract file info from message content
        val fileName = extractFileNameFromContent(saved.content)

        return MessageDto.FileMessageResponse(
            messageId = saved.id,
            fileId = null,
            fileName = fileName,
            originalFileName = fileName,
            fileType = if (saved.messageType == MessageType.IMAGE) "image/*" else "application/octet-stream",
            fileSize = 0L,
            description = "Deleted: ${saved.content}",
            uploaderId = uploader.id,
            uploaderName = uploader.email,
            chatRoomId = saved.chatRoom.id,
            chatRoomName = saved.chatRoom.name,
            timestamp = saved.timeStamp,
            uploadStatus = "Deleted"
        )
    }

    /**
     * Get file type from message
     */
    private fun getFileTypeFromMessage(message: Message): String {
        return when (message.messageType) {
            MessageType.IMAGE -> "image/*"
            MessageType.FILE -> {
                val fileName = extractFileNameFromContent(message.content)
                when {
                    fileName.endsWith(".pdf", ignoreCase = true) -> "application/pdf"
                    fileName.endsWith(".doc", ignoreCase = true) ||
                            fileName.endsWith(".docx", ignoreCase = true) -> "application/msword"
                    fileName.endsWith(".xls", ignoreCase = true) ||
                            fileName.endsWith(".xlsx", ignoreCase = true) -> "application/vnd.ms-excel"
                    else -> "application/octet-stream"
                }
            }
            else -> "text/plain"
        }
    }

    /**
     * Extract file ID from message content
     */
    private fun extractFileIdFromContent(content: String): Long? {
        // Try to extract file ID from content pattern like "File: filename (ID: 123)"
        val pattern = Regex("""ID:\s*(\d+)""")
        return pattern.find(content)?.groupValues?.get(1)?.toLongOrNull()
    }

    /**
     * Extract file size from message content
     */
    private fun extractFileSizeFromContent(content: String): Long {
        // Try to extract file size from content pattern like "File: filename (Size: 1024)"
        val pattern = Regex("""Size:\s*(\d+)""")
        return pattern.find(content)?.groupValues?.get(1)?.toLongOrNull() ?: 0L
    }

    /**
     * Extract file name from message content
     */
    private fun extractFileNameFromContent(content: String): String {
        return when {
            content.startsWith("File: ") -> {
                content.substringAfter("File: ")
                    .substringBefore(" (ID:")
                    .substringBefore(" (Size:")
                    .trim()
            }
            content.startsWith("📎 File: ") -> {
                content.substringAfter("📎 File: ")
                    .substringBefore(" (ID:")
                    .substringBefore(" (Size:")
                    .substringBefore(" - ")
                    .trim()
            }
            else -> content
        }
    }

    /**
     * Extract description from message content
     */
    private fun extractDescriptionFromContent(content: String): String {
        return when {
            content.contains(" - ") -> {
                content.substringAfter(" - ").trim()
            }
            else -> ""
        }
    }

    /**
     * Map Message entity to MessageResponse DTO
     */
    private fun mapToMessageResponse(message: Message): MessageDto.MessageResponse {
        // Récupérer les infos de l'expéditeur via Feign
        val sender = usersWebChatInterface.getUserBasicInfo(message.senderId)
            .getBodyOrThrow("User not found with id: ${message.senderId}")

        return MessageDto.MessageResponse(
            id = message.id,
            content = message.content,
            sender = UserDto.UserSimpleResponse(
                id = sender.id,
                email = sender.email
            ),
            chatRoomId = message.chatRoom.id,
            timestamp = message.timeStamp,
            messageType = message.messageType,
            isDeleted = message.isDeleted
        )
    }

    /**
     * Map Message entity to MessageDetailResponse DTO
     */
    private fun mapToMessageDetailResponse(message: Message): MessageDto.MessageDetailResponse {
        // Récupérer les infos complètes de l'expéditeur via Feign
        val sender = usersWebChatInterface.getUserBasicInfo(message.senderId)
            .getBodyOrThrow("User not found with id: ${message.senderId}")

        return MessageDto.MessageDetailResponse(
            id = message.id,
            content = message.content,
            sender = sender,  // UserDto.UserResponse
            chatRoom = mapToChatRoomResponse(message.chatRoom),
            timeStamp = message.timeStamp,
            messageType = message.messageType,
            isDeleted = message.isDeleted
        )
    }

    /**
     * Map ChatRoom to ChatRoomResponse DTO
     * Note: Adjust based on your actual ChatRoomDto structure
     */
    private fun mapToChatRoomResponse(chatRoom: ChatRoom): ChatRoom {
        // This should return ChatRoomDto.ChatRoomResponse
        // Adjust based on your actual ChatRoom entity and DTO structure
        return chatRoom
    }
}
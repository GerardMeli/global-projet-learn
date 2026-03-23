package com.reli237.web_application_chat.service

import com.reli237.web_application_chat.dto.ChatRoomDto
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

    private fun <T> ResponseEntity<T>.getBodyOrThrow(errorMessage: String): T {
        if (!this.statusCode.is2xxSuccessful || this.body == null) throw IllegalArgumentException(errorMessage)
        return this.body!!
    }

    // ═══════════════════════════════════════════════════════════
    // CRUD
    // ═══════════════════════════════════════════════════════════

    @Transactional
    fun createMessage(userId: String, request: MessageDto.MessageCreateRequest): MessageDto.MessageResponse {
        val user = usersWebChatInterface.getUserBasicInfo(userId)
            .getBodyOrThrow("User not found with id: $userId")
        val chatRoom = chatRoomRepository.findById(request.chatRoomId)
            .orElseThrow { EntityNotFoundException("Chat room not found with id: ${request.chatRoomId}") }
        val saved = messageRepository.save(
            Message(
                id = "", content = request.content, senderId = userId,
                chatRoom = chatRoom, timeStamp = LocalDateTime.now(),
                messageType = request.messageType, isDeleted = false
            )
        )
        return mapToMessageResponse(saved)
    }

    fun updateMessage(messageId: String, request: MessageDto.MessageUpdateRequest): MessageDto.MessageResponse {
        val message = findMessageById(messageId)
        if (message.isDeleted) throw IllegalStateException("Cannot update a deleted message")
        if (request.content.isNullOrBlank()) return mapToMessageResponse(message)
        return mapToMessageResponse(messageRepository.save(message.copy(content = request.content)))
    }

    fun deleteMessage(messageId: String): MessageDto.MessageResponse =
        mapToMessageResponse(messageRepository.save(findMessageById(messageId).copy(isDeleted = true)))

    fun restoreMessage(messageId: String): MessageDto.MessageResponse {
        val message = findMessageById(messageId)
        if (!message.isDeleted) throw IllegalStateException("Message is not deleted")
        return mapToMessageResponse(messageRepository.save(message.copy(isDeleted = false)))
    }

    fun permanentlyDeleteMessage(messageId: String) {
        if (!messageRepository.existsById(messageId))
            throw IllegalArgumentException("Message not found with id: $messageId")
        messageRepository.deleteById(messageId)
    }

    // ═══════════════════════════════════════════════════════════
    // REQUÊTES — Messages d'une salle
    // Remplace : getMessagesByChatRoom + getMessagesByChatRoomOrdered
    //            + getActiveMessagesByChatRoom (3 fonctions → 1)
    // ═══════════════════════════════════════════════════════════

    /**
     * @param ordered  true  → ORDER BY timeStamp ASC (défaut, utile pour affichage chat)
     *                 false → pas d'ordre garanti, légèrement plus rapide
     */
    fun getMessagesByChatRoom(chatRoomId: String, ordered: Boolean = true): List<MessageDto.MessageResponse> {
        requireChatRoomExists(chatRoomId)
        val messages = if (ordered)
            messageRepository.findByChatRoomIdOrderByTimeStampAsc(chatRoomId)
        else
            messageRepository.findByChatRoomIdAndIsDeletedFalse(chatRoomId)
        return messages.filter { !it.isDeleted }.map { mapToMessageResponse(it) }
    }

    // Alias conservé pour rétrocompatibilité avec ChatRoomService
    fun getMessagesByChatRoomOrdered(chatRoomId: String) = getMessagesByChatRoom(chatRoomId, ordered = true)

    fun getActiveMessagesByChatRoomAndSender(chatRoomId: String, senderId: String): List<MessageDto.MessageResponse> {
        requireChatRoomExists(chatRoomId)
        requireUserExists(senderId)
        return messageRepository.findByChatRoomIdAndSenderIdAndIsDeletedFalse(chatRoomId, senderId)
            .map { mapToMessageResponse(it) }
    }

    fun countMessagesByChatRoom(chatRoomId: String): Long =
        messageRepository.countByChatRoomId(chatRoomId)

    // ═══════════════════════════════════════════════════════════
    // REQUÊTES — Messages d'un sender
    // Remplace : getMessagesBySender + getMessagesBySenderOrdered (2 → 1)
    // ═══════════════════════════════════════════════════════════

    /**
     * @param ordered  true → ORDER BY timeStamp DESC
     *                 false → pas de tri (défaut)
     */
    fun getMessagesBySender(senderId: String, ordered: Boolean = false): List<MessageDto.MessageResponse> {
        requireUserExists(senderId)
        val messages = if (ordered)
            messageRepository.findBySenderIdOrderByTimeStampDesc(senderId)
        else
            messageRepository.findBySenderIdAndIsDeletedFalse(senderId)
        return messages.filter { !it.isDeleted }.map { mapToMessageResponse(it) }
    }

    fun countMessagesBySender(senderId: String): Long = messageRepository.countBySenderId(senderId)

    // ═══════════════════════════════════════════════════════════
    // REQUÊTES — Filtrages divers
    // ═══════════════════════════════════════════════════════════

    fun getAllActiveMessages(): List<MessageDto.MessageResponse> =
        messageRepository.findByIsDeletedFalse().map { mapToMessageResponse(it) }

    fun getAllMessages(): List<MessageDto.MessageResponse> =
        messageRepository.findAll().map { mapToMessageResponse(it) }

    fun getMessagesByType(messageType: MessageType): List<MessageDto.MessageResponse> =
        messageRepository.findByMessageType(messageType)
            .filter { !it.isDeleted }.map { mapToMessageResponse(it) }

    // ═══════════════════════════════════════════════════════════
    // FICHIERS
    // Remplace : getChatRoomFilesAlternative → getFilesByChatRoom
    // ═══════════════════════════════════════════════════════════

    fun getFilesByChatRoom(chatRoomId: String): List<MessageDto.FileMessageResponse> {
        val chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow { EntityNotFoundException("Chat room not found with id: $chatRoomId") }
        return messageRepository.findByChatRoomIdAndMessageTypeIn(
            chatRoomId, listOf(MessageType.FILE, MessageType.IMAGE)
        ).map { message ->
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
                uploaderId = uploader.id, uploaderName = uploader.email,
                chatRoomId = chatRoom.id, chatRoomName = chatRoom.name,
                timestamp = message.timeStamp, uploadStatus = "Stored"
            )
        }
    }

    fun deleteFileMessage(messageId: String): MessageDto.FileMessageResponse {
        val message = findMessageById(messageId)
        if (message.messageType != MessageType.FILE && message.messageType != MessageType.IMAGE)
            throw IllegalArgumentException("Message is not a file message")
        val saved = messageRepository.save(message.copy(isDeleted = true))
        val uploader = usersWebChatInterface.getUserBasicInfo(saved.senderId)
            .getBodyOrThrow("User not found with id: ${saved.senderId}")
        val fileName = extractFileNameFromContent(saved.content)
        return MessageDto.FileMessageResponse(
            messageId = saved.id, fileId = null,
            fileName = fileName, originalFileName = fileName,
            fileType = if (saved.messageType == MessageType.IMAGE) "image/*" else "application/octet-stream",
            fileSize = 0L, description = "Deleted: ${saved.content}",
            uploaderId = uploader.id, uploaderName = uploader.email,
            chatRoomId = saved.chatRoom.id, chatRoomName = saved.chatRoom.name,
            timestamp = saved.timeStamp, uploadStatus = "Deleted"
        )
    }

    fun getFileDownloadUrl(fileName: String): String = "/api/files/download/$fileName"

    // ═══════════════════════════════════════════════════════════
    // WEBSOCKET HELPERS
    // ═══════════════════════════════════════════════════════════

    fun getMessageById(id: String): MessageDto.MessageDetailResponse {
        val message = findMessageById(id)
        val sender = usersWebChatInterface.getUserBasicInfo(message.senderId)
            .getBodyOrThrow("User not found with id: ${message.senderId}")
        return MessageDto.MessageDetailResponse(
            id = message.id, content = message.content, sender = sender,
            chatRoom = ChatRoomDto.ChatRoomResponse(
                id = message.chatRoom.id, name = message.chatRoom.name,
                type = message.chatRoom.type, participantCount = message.chatRoom.participants.size
            ),
            timeStamp = message.timeStamp, messageType = message.messageType, isDeleted = message.isDeleted
        )
    }

    fun getTypingUsersInRoom(roomId: String): List<MessageDto.TypingUser> {
        requireChatRoomExists(roomId)
        return emptyList() // Géré en temps réel via WebSocket
    }

    fun getMessageReadStatus(messageId: String): List<MessageDto.UserReadInfo> {
        val message = findMessageById(messageId)
        val sender = usersWebChatInterface.getUserBasicInfo(message.senderId)
            .getBodyOrThrow("User not found with id: ${message.senderId}")
        return listOf(
            MessageDto.UserReadInfo(
                userId = sender.id, username = sender.email,
                readAt = message.timeStamp.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
            )
        )
    }

    // ═══════════════════════════════════════════════════════════
    // HELPERS PRIVÉS
    // ═══════════════════════════════════════════════════════════

    private fun findMessageById(id: String): Message =
        messageRepository.findById(id).orElseThrow { IllegalArgumentException("Message not found with id: $id") }

    private fun requireChatRoomExists(chatRoomId: String) =
        chatRoomRepository.findById(chatRoomId)
            .orElseThrow { IllegalArgumentException("Chat room not found with id: $chatRoomId") }

    private fun requireUserExists(userId: String) =
        usersWebChatInterface.getUserBasicInfo(userId).getBodyOrThrow("User not found with id: $userId")

    private fun mapToMessageResponse(message: Message): MessageDto.MessageResponse {
        val sender = usersWebChatInterface.getUserBasicInfo(message.senderId)
            .getBodyOrThrow("User not found with id: ${message.senderId}")
        return MessageDto.MessageResponse(
            id = message.id, content = message.content,
            sender = UserDto.UserSimpleResponse(id = sender.id, email = sender.email),
            chatRoomId = message.chatRoom.id, timestamp = message.timeStamp,
            messageType = message.messageType, isDeleted = message.isDeleted
        )
    }

    private fun getFileTypeFromMessage(message: Message): String = when (message.messageType) {
        MessageType.IMAGE -> "image/*"
        MessageType.FILE -> {
            val name = extractFileNameFromContent(message.content)
            when {
                name.endsWith(".pdf", ignoreCase = true) -> "application/pdf"
                name.endsWith(".doc", ignoreCase = true) || name.endsWith(".docx", ignoreCase = true) -> "application/msword"
                name.endsWith(".xls", ignoreCase = true) || name.endsWith(".xlsx", ignoreCase = true) -> "application/vnd.ms-excel"
                else -> "application/octet-stream"
            }
        }
        else -> "text/plain"
    }

    private fun extractFileIdFromContent(content: String): String? =
        Regex("""ID:\s*(\d+)""").find(content)?.groupValues?.get(1)

    private fun extractFileSizeFromContent(content: String): Long =
        Regex("""Size:\s*(\d+)""").find(content)?.groupValues?.get(1)?.toLongOrNull() ?: 0L

    private fun extractFileNameFromContent(content: String): String = when {
        content.contains("📎 File:") -> content.substringAfter("📎 File: ").substringBefore(" - ").substringBefore(" (").trim()
        content.contains("File:") -> content.substringAfter("File: ").substringBefore(" (").trim()
        else -> content
    }

    private fun extractDescriptionFromContent(content: String): String =
        if (content.contains(" - ")) content.substringAfter(" - ").trim() else ""

}
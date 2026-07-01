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
import java.util.concurrent.ConcurrentHashMap

@Service
class PrivateChatService(
    private val privateChatRepository: PrivateChatRepository,
    private val usersWebChatInterface: UsersWebChatInterface,
    private val messagingTemplate: SimpMessagingTemplate,
    private val fileWebChatInterface: FileWebChatInterface
) {

    // Store typing status in memory (consider using Redis for production)
    private val typingStatus = ConcurrentHashMap<String, UserTypingStatus>()

    private fun <T> ResponseEntity<T>.getBodyOrThrow(errorMessage: String): T {
        if (!this.statusCode.is2xxSuccessful || this.body == null) throw IllegalArgumentException(errorMessage)
        return this.body!!
    }

    // ═══════════════════════════════════════════════════════════
    // MESSAGES TEXTE
    // ═══════════════════════════════════════════════════════════

    @Transactional
    fun sendMessage(senderId: String, request: PrivateDto.PrivateChatRequest): PrivateDto.PrivateChatResponse {
        if (senderId == request.senderId2) throw IllegalArgumentException("Cannot send message to yourself")

        val sender = requireUser(senderId, "Sender not found")
        val receiver = requireUser(request.senderId2, "Receiver not found")

        val saved = privateChatRepository.save(
            PrivateChat(senderId1 = senderId, senderId2 = request.senderId2, content = request.content.trim())
        )

        // ✅ OPTIMISATION : un seul helper pour notifier sender + receiver
        sendToSenderAndReceiver(
            senderId = sender.id, receiverId = receiver.id,
            buildNotification = { isOwn ->
                PrivateChatNotification(
                    messageId = saved.id, senderId = sender.id, senderName = sender.email,
                    content = saved.content, timestamp = saved.timestamp,
                    unreadCount = getUnreadCount(if (isOwn) sender.id else receiver.id),
                    isOwnMessage = isOwn, isFile = false
                )
            },
            topic = { userId -> "/topic/private/$userId" }
        )

        return convertToResponse(saved)
    }

    fun getChatBetweenUserResponse(userId1: String, userId2: String): List<PrivateDto.PrivateChatResponse> =
        privateChatRepository.findChatBetweenUsers(userId1, userId2).map { convertToResponse(it) }

    fun getAllPrivateChats(): List<PrivateDto.PrivateChatResponse> =
        privateChatRepository.findAll().map { convertToResponse(it) }

    fun getUserChats(userId: String): List<PrivateDto.PrivateChatResponse> =
        privateChatRepository.findUserChats(userId).map { convertToResponse(it) }

    fun getUserContacts(userId: String): List<UserContactDTO> {
        val contactIds = privateChatRepository.findUserContactIds(userId)

        return contactIds.map { contactId ->
            val contact = requireUser(contactId, "User not found with id: $contactId")

            // ✅ OPTIMISATION : un seul appel findChatBetweenUsers au lieu de deux
            val conversation = privateChatRepository.findChatBetweenUsers(userId, contactId)
            val lastMessage = conversation.lastOrNull()
            val unreadCount = conversation.count { it.senderId2 == userId && !it.isRead }

            UserContactDTO(
                userId = contact.id,
                username = contact.email,
                lastMessage = lastMessage?.content ?: "",
                lastMessageTime = lastMessage?.timestamp,
                unreadCount = unreadCount
            )
        }
    }

    @Transactional
    fun markMessagesAsRead(userId: String, request: PrivateDto.MarkAsReadRequest) {
        val updatedCount = privateChatRepository.markMessagesAsRead(request.messageIds, userId)
        if (updatedCount > 0) {
            privateChatRepository.findMessagesByIdsAndUser(request.messageIds, userId)
                .firstOrNull()?.let { firstMessage ->
                    messagingTemplate.convertAndSend(
                        "/topic/private/read/${firstMessage.senderId1}",
                        MessagesReadNotification(messageIds = request.messageIds, readerId = userId)
                    )
                }
        }
    }

    fun getUnreadCount(userId: String): Long = privateChatRepository.countUnreadMessages(userId)

    // ═══════════════════════════════════════════════════════════
    // FICHIERS
    // ═══════════════════════════════════════════════════════════

    @Transactional
    fun sendFile(senderId: String, receiverId: String, file: MultipartFile, description: String = ""): PrivateDto.PrivateFileResponse {
        if (senderId == receiverId) throw IllegalArgumentException("Cannot send file to yourself")

        val sender = requireUser(senderId, "Sender not found")
        val receiver = requireUser(receiverId, "Receiver not found")

        val uploadResponse = fileWebChatInterface.uploadFile(file, description)
        if (!uploadResponse.statusCode.is2xxSuccessful)
            throw IllegalStateException("File upload failed: ${uploadResponse.statusCode}")

        val responseBody = uploadResponse.body ?: emptyMap()
        val fileName = responseBody["fileName"]?.toString() ?: file.originalFilename
        val fileId = responseBody["id"]?.toString()
        val fileMessageContent = if (description.isNotBlank()) "📎 File: $fileName - $description" else "📎 File: $fileName"

        val saved = privateChatRepository.save(
            PrivateChat(senderId1 = senderId, senderId2 = receiverId, content = fileMessageContent)
        )

        val response = PrivateDto.PrivateFileResponse(
            messageId = saved.id,
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
            timestamp = saved.timestamp,
            uploadStatus = "File uploaded successfully",
            downloadUrl = generateDownloadUrl(fileName)
        )

        // ✅ OPTIMISATION : même helper que sendMessage pour notifier sender + receiver
        sendToSenderAndReceiver(
            senderId = sender.id, receiverId = receiver.id,
            buildNotification = { isOwn ->
                PrivateFileNotification(
                    messageId = saved.id, senderId = sender.id, senderName = sender.email,
                    fileName = response.fileName, fileType = response.fileType,
                    fileSize = response.fileSize, description = response.description,
                    timestamp = saved.timestamp, downloadUrl = response.downloadUrl,
                    isOwnMessage = isOwn
                )
            },
            topic = { userId -> "/topic/private/file/$userId" }
        )

        return response
    }

    fun getFilesBetweenUsers(userId1: String, userId2: String): List<PrivateDto.PrivateFileResponse> =
        privateChatRepository.findChatBetweenUsers(userId1, userId2)
            .filter { isFileMessage(it.content) }
            .map { message ->
                val sender = requireUser(message.senderId1, "User not found with id: ${message.senderId1}")
                val receiver = requireUser(message.senderId2, "User not found with id: ${message.senderId2}")
                val fileName = extractFileNameFromContent(message.content) // ✅ un seul appel
                buildFileResponse(message, sender, receiver, fileName, "Stored")
            }

    @Transactional
    fun deleteFileMessage(messageId: String): PrivateDto.PrivateFileResponse {
        val message = privateChatRepository.findById(messageId)
            .orElseThrow { IllegalArgumentException("Message not found with id: $messageId") }
        if (!isFileMessage(message.content)) throw IllegalArgumentException("Message is not a file message")

        val sender = requireUser(message.senderId1, "User not found with id: ${message.senderId1}")
        val receiver = requireUser(message.senderId2, "User not found with id: ${message.senderId2}")
        val fileName = extractFileNameFromContent(message.content) // ✅ un seul appel

        return buildFileResponse(message, sender, receiver, fileName, "Deleted")
    }

    fun setUserTyping(senderId: String, receiverId: String) {
        val key = generateTypingKey(senderId, receiverId)
        typingStatus[key] = UserTypingStatus(
            userId = senderId,
            receiverId = receiverId,
            isTyping = true,
            startedAt = System.currentTimeMillis()
        )
    }

    fun removeUserTyping(senderId: String, receiverId: String) {
        val key = generateTypingKey(senderId, receiverId)
        typingStatus.remove(key)
    }

    fun getTypingUsers(receiverId: String): List<UserTypingStatus> {
        val now = System.currentTimeMillis()
        val timeout = 5000 // 5 seconds timeout for typing indicator

        return typingStatus.values
            .filter { it.receiverId == receiverId && now - it.startedAt < timeout }
            .also {
                // Clean up expired typing statuses
                it.forEach { status ->
                    if (now - status.startedAt >= timeout) {
                        typingStatus.remove(generateTypingKey(status.userId, status.receiverId))
                    }
                }
            }
    }

    private fun generateTypingKey(senderId: String, receiverId: String): String {
        return "$senderId:$receiverId"
    }

    // ═══════════════════════════════════════════════════════════
    // HELPERS PRIVÉS
    // ═══════════════════════════════════════════════════════════

    private fun requireUser(userId: String, errorMessage: String): UserDto.UserResponse =
        usersWebChatInterface.getUserBasicInfo(userId).getBodyOrThrow(errorMessage)

    private fun convertToResponse(chat: PrivateChat): PrivateDto.PrivateChatResponse {
        val sender = requireUser(chat.senderId1, "User not found with id: ${chat.senderId1}")
        val receiver = requireUser(chat.senderId2, "User not found with id: ${chat.senderId2}")
        return PrivateDto.PrivateChatResponse(
            id = chat.id, senderId1 = chat.senderId1, senderId2 = chat.senderId2,
            senderName1 = sender.email, senderName2 = receiver.email,
            content = chat.content, timestamp = chat.timestamp, isRead = chat.isRead
        )
    }

    /**
     * ✅ Helper générique pour envoyer une notification WebSocket à sender ET receiver.
     * Remplace sendMessageNotifications + sendFileNotifications (code dupliqué).
     * @param buildNotification  lambda qui reçoit isOwnMessage (true=sender, false=receiver)
     * @param topic              lambda qui calcule le topic à partir de l'userId
     */
    private fun <T: Any> sendToSenderAndReceiver(
        senderId: String, receiverId: String,
        buildNotification: (isOwn: Boolean) -> T,
        topic: (userId: String) -> String
    ) {
        messagingTemplate.convertAndSend(topic(receiverId), buildNotification(false))
        messagingTemplate.convertAndSend(topic(senderId), buildNotification(true))
    }

    /**
     * ✅ Helper pour construire un PrivateFileResponse — évite la duplication
     * entre getFilesBetweenUsers et deleteFileMessage.
     */
    private fun buildFileResponse(
        message: PrivateChat,
        sender: UserDto.UserResponse,
        receiver: UserDto.UserResponse,
        fileName: String,
        uploadStatus: String
    ): PrivateDto.PrivateFileResponse = PrivateDto.PrivateFileResponse(
        messageId = message.id,
        fileId = extractFileIdFromContent(message.content),
        fileName = fileName,
        originalFileName = fileName,
        fileType = extractFileTypeFromContent(message.content),
        fileSize = 0L,
        description = if (uploadStatus == "Deleted")
            "Deleted: ${extractDescriptionFromContent(message.content)}"
        else
            extractDescriptionFromContent(message.content),
        senderId = sender.id, senderName = sender.email,
        receiverId = receiver.id, receiverName = receiver.email,
        timestamp = message.timestamp,
        uploadStatus = uploadStatus,
        downloadUrl = if (uploadStatus == "Deleted") "" else generateDownloadUrl(fileName)
    )

    private fun isFileMessage(content: String): Boolean =
        content.contains("📎 File:") || content.startsWith("File:")

    private fun extractFileNameFromContent(content: String): String = when {
        content.contains("📎 File:") -> content.substringAfter("📎 File: ").substringBefore(" - ").trim()
        content.contains("File:") -> content.substringAfter("File: ").trim()
        else -> content
    }

    private fun extractFileIdFromContent(content: String): String? = null

    private fun extractFileTypeFromContent(content: String): String {
        val name = extractFileNameFromContent(content)
        return when {
            name.matches(Regex(".*\\.(jpg|jpeg|png|gif|bmp|webp)$", RegexOption.IGNORE_CASE)) -> "image/*"
            name.matches(Regex(".*\\.pdf$", RegexOption.IGNORE_CASE)) -> "application/pdf"
            name.matches(Regex(".*\\.(doc|docx)$", RegexOption.IGNORE_CASE)) -> "application/msword"
            name.matches(Regex(".*\\.(xls|xlsx)$", RegexOption.IGNORE_CASE)) -> "application/vnd.ms-excel"
            else -> "application/octet-stream"
        }
    }

    private fun extractDescriptionFromContent(content: String): String =
        if (content.contains(" - ")) content.substringAfter(" - ").trim() else ""

    private fun generateDownloadUrl(fileName: String?): String = "/api/files/download/$fileName"

    // ═══════════════════════════════════════════════════════════
    // DTOs INTERNES (notifications WebSocket)
    // ═══════════════════════════════════════════════════════════

    data class MessagesReadNotification(
        val messageIds: List<String>,
        val readerId: String
    )

    data class PrivateChatNotification(
        val messageId: String,
        val senderId: String,
        val senderName: String,
        val content: String,
        val timestamp: LocalDateTime,
        val unreadCount: Long = 0,
        val isOwnMessage: Boolean = false,
        val isFile: Boolean = false
    )

    data class PrivateFileNotification(
        val messageId: String,
        val senderId: String,
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
        val userId: String,
        val username: String,
        val lastMessage: String,
        val lastMessageTime: LocalDateTime?,
        val unreadCount: Int
    )

    data class UserTypingStatus(
        val userId: String,
        val receiverId: String,
        val isTyping: Boolean,
        val startedAt: Long
    )

}
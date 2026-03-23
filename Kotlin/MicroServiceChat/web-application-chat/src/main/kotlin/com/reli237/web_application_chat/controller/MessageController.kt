package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.MessageDto
import com.reli237.web_application_chat.model.MessageType
import com.reli237.web_application_chat.service.MessageService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/message")
@Tag(name = "Messages", description = "Management of messages in chat rooms")
class MessageController(
    private val messageService: MessageService,
    private val messagingTemplate: SimpMessagingTemplate
) {

    // ═══════════════════════════════════════════════════════════
    // CRUD
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/messages")
    @Operation(summary = "Create message", description = "Sends a new message to a chat room")
    fun createMessage(
        @RequestHeader("X-User-Id") userId: String,
        @RequestBody request: MessageDto.MessageCreateRequest
    ): ResponseEntity<MessageDto.MessageResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(messageService.createMessage(userId, request))

    @PutMapping("/messages/{messageId}")
    @Operation(summary = "Update message", description = "Edits the content of an existing message")
    fun updateMessage(
        @PathVariable messageId: String,
        @RequestBody request: MessageDto.MessageUpdateRequest
    ): ResponseEntity<MessageDto.MessageResponse> =
        ResponseEntity.ok(messageService.updateMessage(messageId, request))

    @DeleteMapping("/messages/{messageId}")
    @Operation(summary = "Soft delete message", description = "Marks a message as deleted without removing it from the database")
    fun deleteMessage(@PathVariable messageId: String): ResponseEntity<MessageDto.MessageResponse> =
        ResponseEntity.ok(messageService.deleteMessage(messageId))

    @PostMapping("/messages/{messageId}/restore")
    @Operation(summary = "Restore message", description = "Restores a previously soft-deleted message")
    fun restoreMessage(@PathVariable messageId: String): ResponseEntity<MessageDto.MessageResponse> =
        ResponseEntity.ok(messageService.restoreMessage(messageId))

    @DeleteMapping("/messages/{messageId}/permanent")
    @Operation(summary = "Permanent delete message", description = "Permanently removes a message from the database")
    fun permanentlyDeleteMessage(@PathVariable messageId: String): ResponseEntity<Void> {
        messageService.permanentlyDeleteMessage(messageId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/messages/{id}")
    @Operation(summary = "Get message by ID", description = "Retrieves detailed information about a specific message")
    fun getMessageById(@PathVariable id: String): ResponseEntity<MessageDto.MessageDetailResponse> =
        ResponseEntity.ok(messageService.getMessageById(id))

    // ═══════════════════════════════════════════════════════════
    // MESSAGES D'UNE SALLE
    // ═══════════════════════════════════════════════════════════

    /** Ordonné ASC par défaut (ordered=true). Passer ?ordered=false pour sans tri. */
    @GetMapping("/rooms/{roomId}/messages")
    @Operation(summary = "Get room messages", description = "Retrieves all messages for a specific chat room")
    fun getMessagesByRoom(
        @PathVariable roomId: String,
        @RequestParam(defaultValue = "true") ordered: Boolean
    ): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getMessagesByChatRoom(roomId, ordered))

    @GetMapping("/rooms/{roomId}/messages/sender/{senderId}")
    @Operation(summary = "Get room messages by sender", description = "Retrieves all active messages sent by a specific user in a room")
    fun getMessagesByChatRoomAndSender(
        @PathVariable roomId: String,
        @PathVariable senderId: String
    ): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getActiveMessagesByChatRoomAndSender(roomId, senderId))

    @GetMapping("/rooms/{roomId}/messages/count")
    @Operation(summary = "Count room messages", description = "Returns the number of messages in a specific chat room")
    fun countMessagesByRoom(
        @PathVariable roomId: String
    ): ResponseEntity<Map<String, Long>> =
        ResponseEntity.ok(mapOf("count" to messageService.countMessagesByChatRoom(roomId)))

    // ═══════════════════════════════════════════════════════════
    // MESSAGES D'UN SENDER
    // ═══════════════════════════════════════════════════════════

    /** Passer ?ordered=true pour ORDER BY timestamp DESC */
    @GetMapping("/users/{senderId}/messages")
    @Operation(summary = "Get messages by sender", description = "Retrieves all messages sent by a specific user across all rooms")
    fun getMessagesBySender(
        @PathVariable senderId: String,
        @RequestParam(defaultValue = "false") ordered: Boolean
    ): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getMessagesBySender(senderId, ordered))

    @GetMapping("/users/{senderId}/messages/count")
    @Operation(summary = "Count messages by sender", description = "Returns the total number of messages sent by a user")
    fun countMessagesBySender(
        @PathVariable senderId: String
    ): ResponseEntity<Map<String, Long>> =
        ResponseEntity.ok(mapOf("count" to messageService.countMessagesBySender(senderId)))

    // ═══════════════════════════════════════════════════════════
    // FILTRAGES DIVERS
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/messages/active")
    @Operation(summary = "Get all active messages", description = "Lists all messages that are not soft-deleted")
    fun getAllActiveMessages(): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getAllActiveMessages())

    @GetMapping("/messages/all")
    @Operation(summary = "Get all messages", description = "Lists all messages including soft-deleted ones (Admin only)")
    fun getAllMessages(): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getAllMessages())

    @GetMapping("/messages/type/{messageType}")
    @Operation(summary = "Get messages by type", description = "Filters messages by type (TEXT, IMAGE, FILE, etc.)")
    fun getMessagesByType(
        @PathVariable messageType: MessageType
    ): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getMessagesByType(messageType))

    // ═══════════════════════════════════════════════════════════
    // FICHIERS
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/rooms/{roomId}/files")
    @Operation(summary = "Get files in room", description = "Lists all file/image messages shared in a chat room")
    fun getFilesByRoom(
        @PathVariable roomId: String
    ): ResponseEntity<List<MessageDto.FileMessageResponse>> =
        ResponseEntity.ok(messageService.getFilesByChatRoom(roomId))

    @DeleteMapping("/messages/{messageId}/file")
    @Operation(summary = "Delete file message", description = "Deletes a file associated with a message")
    fun deleteFileMessage(
        @PathVariable messageId: String
    ): ResponseEntity<MessageDto.FileMessageResponse> =
        ResponseEntity.ok(messageService.deleteFileMessage(messageId))

    @GetMapping("/files/download/{fileName}")
    @Operation(summary = "Get file download URL", description = "Generates or retrieves a download link for a specific file")
    fun getFileDownloadUrl(
        @PathVariable fileName: String
    ): ResponseEntity<Map<String, String>> =
        ResponseEntity.ok(mapOf("downloadUrl" to messageService.getFileDownloadUrl(fileName)))

    // ═══════════════════════════════════════════════════════════
    // WEBSOCKET / NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/rooms/{roomId}/typing")
    @Operation(summary = "Notify typing status", description = "Sends a typing notification to a chat room via WebSocket")
    fun notifyTyping(
        @PathVariable roomId: String,
        @RequestBody typingRequest: MessageDto.TypingRequest
    ): ResponseEntity<MessageDto.TypingNotification> {
        val notification = MessageDto.TypingNotification(
            userId = typingRequest.userId, isTyping = typingRequest.isTyping
        )
        messagingTemplate.convertAndSend("/topic/room/$roomId/typing", notification)
        return ResponseEntity.ok(notification)
    }

    @GetMapping("/rooms/{roomId}/typing-status")
    @Operation(summary = "Get typing users", description = "Retrieves a list of users currently typing in a room")
    fun getTypingStatus(
        @PathVariable roomId: String
    ): ResponseEntity<MessageDto.TypingStatusResponse> =
        ResponseEntity.ok(
            MessageDto.TypingStatusResponse(
                roomId = roomId,
                typingUsers = messageService.getTypingUsersInRoom(roomId)
            )
        )

    @PostMapping("/messages/{messageId}/read")
    @Operation(summary = "Mark message as read", description = "Notifies that a message has been read by a user")
    fun markMessageAsRead(
        @PathVariable messageId: String,
        @RequestParam readByUserId: String,
        principal: Principal
    ): ResponseEntity<MessageDto.MessageReadNotification> {
        val senderId = principal.name.toLongOrNull()
            ?: return ResponseEntity.badRequest().build()
        val notification = MessageDto.MessageReadNotification(
            messageId = messageId, readByUserId = readByUserId, readAt = System.currentTimeMillis()
        )
        messagingTemplate.convertAndSendToUser(senderId.toString(), "/queue/messages/read", notification)
        return ResponseEntity.ok(notification)
    }

    @GetMapping("/messages/{messageId}/read-status")
    @Operation(summary = "Get message read status", description = "Retrieves information about which users have read a message")
    fun getMessageReadStatus(
        @PathVariable messageId: String
    ): ResponseEntity<MessageDto.MessageReadStatusResponse> =
        ResponseEntity.ok(
            MessageDto.MessageReadStatusResponse(
                messageId = messageId,
                readBy = messageService.getMessageReadStatus(messageId)
            )
        )

    @DeleteMapping("/rooms/{roomId}/users/{userId}")
    @Operation(summary = "Remove user and notify", description = "Removes a user from a room and sends a WebSocket notification")
    fun removeUserFromRoom(
        @PathVariable roomId: String,
        @PathVariable userId: String
    ): ResponseEntity<Map<String, String>> {
        messagingTemplate.convertAndSend(
            "/topic/room/$roomId/users",
            MessageDto.UserJoinEvent(userId = userId, username = "Unknown", action = "left the chat")
        )
        return ResponseEntity.ok(
            mapOf(
                "message" to "User removed from room",
                "roomId" to roomId.toString(),
                "userId" to userId.toString()
            )
        )
    }

    // ═══════════════════════════════════════════════════════════
    // GESTION DES ERREURS
    // ═══════════════════════════════════════════════════════════

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(ex: IllegalArgumentException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to (ex.message ?: "Invalid request")))

    @ExceptionHandler(IllegalStateException::class)
    fun handleIllegalState(ex: IllegalStateException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(mapOf("error" to (ex.message ?: "Internal server error")))
}
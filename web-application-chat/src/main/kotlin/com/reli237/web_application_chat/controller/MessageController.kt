package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.MessageDto
import com.reli237.web_application_chat.model.MessageType
import com.reli237.web_application_chat.service.MessageService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/message")
class MessageController(
    private val messageService: MessageService,
    private val messagingTemplate: SimpMessagingTemplate
) {

    // ═══════════════════════════════════════════════════════════
    // CRUD
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/messages")
    fun createMessage(
        @RequestHeader("X-User-Id") userId: Long,
        @RequestBody request: MessageDto.MessageCreateRequest
    ): ResponseEntity<MessageDto.MessageResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(messageService.createMessage(userId, request))

    @PutMapping("/messages/{messageId}")
    fun updateMessage(
        @PathVariable messageId: Long,
        @RequestBody request: MessageDto.MessageUpdateRequest
    ): ResponseEntity<MessageDto.MessageResponse> =
        ResponseEntity.ok(messageService.updateMessage(messageId, request))

    @DeleteMapping("/messages/{messageId}")
    fun deleteMessage(@PathVariable messageId: Long): ResponseEntity<MessageDto.MessageResponse> =
        ResponseEntity.ok(messageService.deleteMessage(messageId))

    @PostMapping("/messages/{messageId}/restore")
    fun restoreMessage(@PathVariable messageId: Long): ResponseEntity<MessageDto.MessageResponse> =
        ResponseEntity.ok(messageService.restoreMessage(messageId))

    @DeleteMapping("/messages/{messageId}/permanent")
    fun permanentlyDeleteMessage(@PathVariable messageId: Long): ResponseEntity<Void> {
        messageService.permanentlyDeleteMessage(messageId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/messages/{id}")
    fun getMessageById(@PathVariable id: Long): ResponseEntity<MessageDto.MessageDetailResponse> =
        ResponseEntity.ok(messageService.getMessageById(id))

    // ═══════════════════════════════════════════════════════════
    // MESSAGES D'UNE SALLE
    // ═══════════════════════════════════════════════════════════

    /** Ordonné ASC par défaut (ordered=true). Passer ?ordered=false pour sans tri. */
    @GetMapping("/rooms/{roomId}/messages")
    fun getMessagesByRoom(
        @PathVariable roomId: Long,
        @RequestParam(defaultValue = "true") ordered: Boolean
    ): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getMessagesByChatRoom(roomId, ordered))

    @GetMapping("/rooms/{roomId}/messages/sender/{senderId}")
    fun getMessagesByChatRoomAndSender(
        @PathVariable roomId: Long,
        @PathVariable senderId: Long
    ): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getActiveMessagesByChatRoomAndSender(roomId, senderId))

    @GetMapping("/rooms/{roomId}/messages/count")
    fun countMessagesByRoom(
        @PathVariable roomId: Long
    ): ResponseEntity<Map<String, Long>> =
        ResponseEntity.ok(mapOf("count" to messageService.countMessagesByChatRoom(roomId)))

    // ═══════════════════════════════════════════════════════════
    // MESSAGES D'UN SENDER
    // ═══════════════════════════════════════════════════════════

    /** Passer ?ordered=true pour ORDER BY timestamp DESC */
    @GetMapping("/users/{senderId}/messages")
    fun getMessagesBySender(
        @PathVariable senderId: Long,
        @RequestParam(defaultValue = "false") ordered: Boolean
    ): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getMessagesBySender(senderId, ordered))

    @GetMapping("/users/{senderId}/messages/count")
    fun countMessagesBySender(
        @PathVariable senderId: Long
    ): ResponseEntity<Map<String, Long>> =
        ResponseEntity.ok(mapOf("count" to messageService.countMessagesBySender(senderId)))

    // ═══════════════════════════════════════════════════════════
    // FILTRAGES DIVERS
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/messages/active")
    fun getAllActiveMessages(): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getAllActiveMessages())

    @GetMapping("/messages/all")
    fun getAllMessages(): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getAllMessages())

    @GetMapping("/messages/type/{messageType}")
    fun getMessagesByType(
        @PathVariable messageType: MessageType
    ): ResponseEntity<List<MessageDto.MessageResponse>> =
        ResponseEntity.ok(messageService.getMessagesByType(messageType))

    // ═══════════════════════════════════════════════════════════
    // FICHIERS
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/rooms/{roomId}/files")
    fun getFilesByRoom(
        @PathVariable roomId: Long
    ): ResponseEntity<List<MessageDto.FileMessageResponse>> =
        ResponseEntity.ok(messageService.getFilesByChatRoom(roomId))

    @DeleteMapping("/messages/{messageId}/file")
    fun deleteFileMessage(
        @PathVariable messageId: Long
    ): ResponseEntity<MessageDto.FileMessageResponse> =
        ResponseEntity.ok(messageService.deleteFileMessage(messageId))

    @GetMapping("/files/download/{fileName}")
    fun getFileDownloadUrl(
        @PathVariable fileName: String
    ): ResponseEntity<Map<String, String>> =
        ResponseEntity.ok(mapOf("downloadUrl" to messageService.getFileDownloadUrl(fileName)))

    // ═══════════════════════════════════════════════════════════
    // WEBSOCKET / NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/rooms/{roomId}/typing")
    fun notifyTyping(
        @PathVariable roomId: Long,
        @RequestBody typingRequest: MessageDto.TypingRequest
    ): ResponseEntity<MessageDto.TypingNotification> {
        val notification = MessageDto.TypingNotification(
            userId = typingRequest.userId, isTyping = typingRequest.isTyping
        )
        messagingTemplate.convertAndSend("/topic/room/$roomId/typing", notification)
        return ResponseEntity.ok(notification)
    }

    @GetMapping("/rooms/{roomId}/typing-status")
    fun getTypingStatus(
        @PathVariable roomId: Long
    ): ResponseEntity<MessageDto.TypingStatusResponse> =
        ResponseEntity.ok(
            MessageDto.TypingStatusResponse(
                roomId = roomId,
                typingUsers = messageService.getTypingUsersInRoom(roomId)
            )
        )

    @PostMapping("/messages/{messageId}/read")
    fun markMessageAsRead(
        @PathVariable messageId: Long,
        @RequestParam readByUserId: Long,
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
    fun getMessageReadStatus(
        @PathVariable messageId: Long
    ): ResponseEntity<MessageDto.MessageReadStatusResponse> =
        ResponseEntity.ok(
            MessageDto.MessageReadStatusResponse(
                messageId = messageId,
                readBy = messageService.getMessageReadStatus(messageId)
            )
        )

    @DeleteMapping("/rooms/{roomId}/users/{userId}")
    fun removeUserFromRoom(
        @PathVariable roomId: Long,
        @PathVariable userId: Long
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
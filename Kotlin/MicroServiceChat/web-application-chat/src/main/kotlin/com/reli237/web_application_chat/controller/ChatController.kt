package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.ChatParticipantDto
import com.reli237.web_application_chat.dto.ChatRoomDto
import com.reli237.web_application_chat.dto.MessageDto
import com.reli237.web_application_chat.model.ParticipantRole
import com.reli237.web_application_chat.service.ChatParticipantService
import com.reli237.web_application_chat.service.ChatRoomService
import com.reli237.web_application_chat.service.MessageService
import org.springframework.http.ResponseEntity
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/chat")
class ChatController (
    private val chatRoomService: ChatRoomService,
    private val chatParticipantService: ChatParticipantService,
    private val messageService: MessageService,
    private val messagingTemplate: SimpMessagingTemplate
) {

    // === Chat Room Endpoints ===

    @PostMapping("/rooms")
    fun createChatRoom(@RequestBody request: ChatRoomDto.ChatRoomCreateRequest): ResponseEntity<ChatRoomDto.ChatRoomResponse> {
        return ResponseEntity.ok(chatRoomService.createChatRoom(request))
    }

    @GetMapping("/rooms")
    fun getAllChatRooms(): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.getAllChatRooms())
    }

    @GetMapping("/rooms/{id}")
    fun getChatRoomById(@PathVariable id: Long): ResponseEntity<ChatRoomDto.ChatRoomDetailResponse> {
        return ResponseEntity.ok(chatRoomService.getChatRoomById(id))
    }

    @GetMapping("/rooms/search")
    fun searchChatRooms(@RequestParam name: String): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.searchChatRoomsByName(name))
    }

    @PutMapping("/rooms/{id}")
    fun updateChatRoom(
        @PathVariable id: Long,
        @RequestBody request: ChatRoomDto.ChatRoomUpdateRequest
    ): ResponseEntity<ChatRoomDto.ChatRoomResponse> {
        return ResponseEntity.ok(chatRoomService.updateChatRoom(id, request))
    }

    @DeleteMapping("/rooms/{id}")
    fun deleteChatRoom(@PathVariable id: Long): ResponseEntity<Void> {
        chatRoomService.deleteChatRoom(id)
        return ResponseEntity.noContent().build()
    }

//    @PostMapping("/rooms/{roomId}/participants")
//    fun addParticipantsToRoom(
//        @PathVariable roomId: Long,
//        @RequestBody request: ChatRoomDto.AddParticipantsRequest
//    ): ResponseEntity<ChatRoomDto.ChatRoomDetailResponse> {
//        return ResponseEntity.ok(chatRoomService.addParticipants(roomId, request.userIds))
//    }

    @DeleteMapping("/rooms/{roomId}/participants/{userId}")
    fun removeParticipantFromRoom(
        @PathVariable roomId: Long,
        @PathVariable userId: Long
    ): ResponseEntity<ChatRoomDto.ChatRoomDetailResponse> {
        return ResponseEntity.ok(chatRoomService.removeParticipant(roomId, userId))
    }

    // === Chat Participant Endpoints ===

    @PostMapping("/participants")
    fun addParticipant(@RequestBody request: ChatParticipantDto.ChatParticipantCreateRequest): ResponseEntity<ChatParticipantDto.ChatParticipantResponse> {
        return ResponseEntity.ok(chatParticipantService.addParticipant(request))
    }

    @GetMapping("/participants/{id}")
    fun getParticipantById(@PathVariable id: Long): ResponseEntity<ChatParticipantDto.ChatParticipantDetailResponse> {
        return ResponseEntity.ok(chatParticipantService.getParticipantById(id))
    }

    @GetMapping("/rooms/{roomId}/participants")
    fun getParticipantsByRoom(@PathVariable roomId: Long): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getParticipantsByChatRoom(roomId))
    }

    @GetMapping("/users/{userId}/rooms")
    fun getRoomsForUser(@PathVariable userId: Long): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getChatRoomsForUser(userId))
    }

    @GetMapping("/rooms/{roomId}/participants/role/{role}")
    fun getParticipantsByRoleInRoom(
        @PathVariable roomId: Long,
        @PathVariable role: ParticipantRole
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getParticipantsByRoleInChatRoom(roomId, role))
    }

    @PutMapping("/participants/{participantId}/role")
    fun updateParticipantRole(
        @PathVariable participantId: Long,
        @RequestBody request: ChatParticipantDto.ChatParticipantUpdateRequest
    ): ResponseEntity<ChatParticipantDto.ChatParticipantResponse> {
        return ResponseEntity.ok(chatParticipantService.updateParticipantRole(participantId, request))
    }

    @DeleteMapping("/participants/{participantId}")
    fun removeParticipant(@PathVariable participantId: Long): ResponseEntity<Void> {
        chatParticipantService.removeParticipant(participantId)
        return ResponseEntity.noContent().build()
    }

    // === Message Endpoints ===

    @PostMapping("/messages")
    fun createMessage(
        @RequestHeader("X-User-Id") userId: Long,
        @RequestBody request: MessageDto.MessageCreateRequest
    ): ResponseEntity<MessageDto.MessageResponse> {
        return ResponseEntity.ok(messageService.createMessage(userId, request))
    }

//    @GetMapping("/messages/{id}")
//    fun getMessageById(@PathVariable id: Long): ResponseEntity<MessageDto.MessageDetailResponse> {
//        return ResponseEntity.ok(messageService.getMessageById(id))
//    }

    @GetMapping("/rooms/{roomId}/messages")
    fun getMessagesByRoom(@PathVariable roomId: Long): ResponseEntity<List<MessageDto.MessageResponse>> {
        return ResponseEntity.ok(messageService.getMessagesByChatRoom(roomId))
    }

    @GetMapping("/rooms/{roomId}/messages/ordered")
    fun getMessagesByRoomOrdered(@PathVariable roomId: Long): ResponseEntity<List<MessageDto.MessageResponse>> {
        return ResponseEntity.ok(messageService.getMessagesByChatRoomOrdered(roomId))
    }

    @PutMapping("/messages/{messageId}")
    fun updateMessage(
        @PathVariable messageId: Long,
        @RequestBody request: MessageDto.MessageUpdateRequest
    ): ResponseEntity<MessageDto.MessageResponse> {
        return ResponseEntity.ok(messageService.updateMessage(messageId, request))
    }

    @DeleteMapping("/messages/{messageId}")
    fun deleteMessage(@PathVariable messageId: Long): ResponseEntity<MessageDto.MessageResponse> {
        return ResponseEntity.ok(messageService.deleteMessage(messageId))
    }

    @PostMapping("/messages/{messageId}/restore")
    fun restoreMessage(@PathVariable messageId: Long): ResponseEntity<MessageDto.MessageResponse> {
        return ResponseEntity.ok(messageService.restoreMessage(messageId))
    }

    // === Utility Endpoints ===

    @GetMapping("/rooms/{roomId}/participants/count")
    fun countParticipants(@PathVariable roomId: Long): ResponseEntity<Long> {
        return ResponseEntity.ok(chatParticipantService.countParticipantsInChatRoom(roomId))
    }

    @GetMapping("/users/{userId}/is-participant/{roomId}")
    fun isUserParticipant(
        @PathVariable userId: Long,
        @PathVariable roomId: Long
    ): ResponseEntity<Boolean> {
        return ResponseEntity.ok(chatParticipantService.isUserParticipant(userId, roomId))
    }

    @GetMapping("/users/{userId}/is-admin/{roomId}")
    fun isUserAdmin(
        @PathVariable userId: Long,
        @PathVariable roomId: Long
    ): ResponseEntity<Boolean> {
        return ResponseEntity.ok(chatParticipantService.isUserAdmin(userId, roomId))
    }

    /**
     * REST endpoint for typing notifications
     * Notifies all users in a room that a user is typing
     */
    @PostMapping("/rooms/{roomId}/typing")
    fun notifyTyping(
        @PathVariable roomId: Long,
        @RequestBody typingRequest: MessageDto.TypingRequest
    ): ResponseEntity<MessageDto.TypingNotification> {
        val typingNotification = MessageDto.TypingNotification(
            typingRequest.userId,
            typingRequest.isTyping
        )

        // Send typing notification to all users in the room
        messagingTemplate.convertAndSend(
            "/topic/room/$roomId/typing",
            typingNotification
        )

        return ResponseEntity.ok(typingNotification)
    }

    /**
     * REST endpoint to mark a message as read
     * Notifies the sender that their message was read
     */
    @PostMapping("/messages/{messageId}/read")
    fun markMessageAsRead(
        @PathVariable messageId: Long,
        @RequestParam readByUserId: Long,
        principal: Principal
    ): ResponseEntity<MessageDto.MessageReadNotification> {
        val senderId = try {
            principal.name.toLong()
        } catch (e: NumberFormatException) {
            return ResponseEntity.badRequest().build()
        }

        val messageReadNotification = MessageDto.MessageReadNotification(
            messageId,
            readByUserId,
            System.currentTimeMillis()
        )

        // Notify the original sender that their message was read
        messagingTemplate.convertAndSendToUser(
            senderId.toString(),
            "/queue/messages/read",
            messageReadNotification
        )

        return ResponseEntity.ok(messageReadNotification)
    }

    /**
     * REST endpoint to add a user to a chat room
     * Notifies all users in the room that a new user joined
     */
//    @PostMapping("/rooms/{roomId}/users")
//    fun addUserToRoom(
//        @PathVariable roomId: Long,
//        @RequestParam userId: Long,
//        @RequestParam(defaultValue = "Anonymous") username: String = "Anonymous",
//        principal: Principal? = null
//    ): ResponseEntity<MessageDto.UserJoinEvent> {
//        // Use provided username or extract from principal
//        val finalUsername = if (username != "Anonymous") {
//            username
//        } else {
//            principal?.name ?: "Anonymous"
//        }
//
//        val userJoinEvent = WebChatController.UserJoinEvent(
//            userId,
//            finalUsername,
//            "joined the chat"
//        )
//
//        // Notify all users in the room about the new user
//        messagingTemplate.convertAndSend(
//            "/topic/room/$roomId/users",
//            userJoinEvent
//        )
//
//        return ResponseEntity.status(HttpStatus.CREATED).body(userJoinEvent)
//    }
//
//    /**
//     * REST endpoint to get typing status for a room
//     */
//    @GetMapping("/rooms/{roomId}/typing-status")
//    fun getTypingStatus(
//        @PathVariable roomId: Long
//    ): ResponseEntity<Map<String, Any>> {
//        // You can implement logic to track typing users
//        val typingUsers = messageService.getTypingUsersInRoom(roomId)
//
//        return ResponseEntity.ok(mapOf(
//            "roomId" to roomId,
//            "typingUsers" to typingUsers,
//            "timestamp" to System.currentTimeMillis()
//        ))
//    }
//
    /**
     * REST endpoint to remove a user from a room
     */
    @DeleteMapping("/rooms/{roomId}/users/{userId}")
    fun removeUserFromRoom(
        @PathVariable roomId: Long,
        @PathVariable userId: Long
    ): ResponseEntity<Map<String, String>> {
        messagingTemplate.convertAndSend(
            "/topic/room/$roomId/users",
            MessageDto.UserJoinEvent(userId, "Unknown", "left the chat")
        )

        return ResponseEntity.ok(mapOf(
            "message" to "User removed from room",
            "roomId" to roomId.toString(),
            "userId" to userId.toString()
        ))
    }

    /**
     * REST endpoint to get message read status
     */
//    @GetMapping("/messages/{messageId}/read-status")
//    fun getMessageReadStatus(
//        @PathVariable messageId: Long
//    ): ResponseEntity<Map<String, Any>> {
//        val readStatus = messageService.getMessageReadStatus(messageId)
//
//        return ResponseEntity.ok(mapOf(
//            "messageId" to messageId,
//            "readBy" to readStatus,
//            "timestamp" to System.currentTimeMillis()
//        ))
//    }

}

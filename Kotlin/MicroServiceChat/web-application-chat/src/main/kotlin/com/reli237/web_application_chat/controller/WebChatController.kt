package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.MessageDto
import com.reli237.web_application_chat.dto.PrivateDto
import com.reli237.web_application_chat.feign.UsersWebChatInterface
import com.reli237.web_application_chat.security.TokenContext
import com.reli237.web_application_chat.service.MessageService
import com.reli237.web_application_chat.service.PrivateChatService
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.DestinationVariable
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessageHeaderAccessor
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.messaging.simp.annotation.SendToUser
import org.springframework.stereotype.Controller
import java.security.Principal

@Controller
class WebChatController(
    private val messageService: MessageService,
    private val messagingTemplate: SimpMessagingTemplate,
    private val privateChatService: PrivateChatService,
    private val usersWebChatInterface: UsersWebChatInterface
) {

    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Envoyer un message à une salle de chat spécifique
     * Le message est diffusé à TOUS les utilisateurs abonnés à la salle
     * ET à l'émetteur lui-même
     *
     * Endpoint pour envoyer un message WebSocket
     *
     * @param roomId ID du salon
     * @param messageRequest Requête contenant le contenu du message
     * @param headerAccessor Accesseur des headers STOMP pour récupérer l'utilisateur
     */
    // ==================== SEND MESSAGE ====================

    /**
     * Endpoint pour envoyer un message WebSocket
     *
     * ✅ IMPORTANT: Récupère l'userId depuis la session (stocké par AuthInterceptor)
     *
     * @param roomId ID du salon
     * @param messageRequest Requête contenant le contenu du message
     * @param headerAccessor Accesseur des headers STOMP pour récupérer les infos
     */
    @MessageMapping("/chat.sendMessage/{roomId}")
    fun sendMessage(
        @DestinationVariable roomId: String,
        @Payload messageRequest: MessageDto.MessageCreateRequest,
        headerAccessor: SimpMessageHeaderAccessor
    ) {
        println("\n🔥🔥🔥 ===== WEBSOCKET MESSAGE RECEIVED ===== 🔥🔥🔥")
        println("📍 Room ID: $roomId")
        println("📝 Content: ${messageRequest.content}")
        println("🆔 Session ID: ${headerAccessor.sessionId}")

        val sessionAttributes = headerAccessor.sessionAttributes
        println("📋 Session attributes keys: ${sessionAttributes?.keys}")

        val userId = sessionAttributes?.get("userId") as? String
        val token  = sessionAttributes?.get("token")  as? String  // ← token depuis session STOMP

        println("👤 User ID from session: $userId")
        println("🔑 Token present: ${token != null}")

        if (userId == null) {
            println("❌ Utilisateur non authentifié!")
            messagingTemplate.convertAndSendToUser(
                headerAccessor.sessionId ?: "unknown",
                "/queue/errors",
                MessageError(
                    code = "NOT_AUTHENTICATED",
                    message = "Utilisateur non authentifié - userId not found in session"
                )
            )
            return
        }

        println("✅ Utilisateur authentifié (ID: $userId)")

        // ← Alimenter le ThreadLocal pour Feign
        TokenContext.set(token)
        try {
            messageRequest.chatRoomId = roomId

            println("💾 Création du message en base de données...")
            println("   - Room: $roomId")
            println("   - User: $userId")
            println("   - Content: ${messageRequest.content}")

            val messageResponse = messageService.createMessage(userId, messageRequest)

            println("✅ Message créé avec l'ID: ${messageResponse.id}")

            // Broadcast à tous les abonnés de la salle
            messagingTemplate.convertAndSend(
                "/topic/room/$roomId",
                MessageEvent(type = "NEW_MESSAGE", message = messageResponse)
            )
            println("✅ Message broadcasté à /topic/room/$roomId")

            // Confirmation à l'émetteur
            try {
                messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/messages/confirmation",
                    MessageConfirmation(
                        messageId = messageResponse.id,
                        status = "SENT",
                        content = "Message envoyé avec succès"
                    )
                )
                println("✅ Confirmation envoyée")
            } catch (e: Exception) {
                println("⚠️ Impossible d'envoyer la confirmation: ${e.message}")
            }

            println("🔥🔥🔥 ===== MESSAGE SENT SUCCESSFULLY ===== 🔥🔥🔥\n")

        } catch (e: Exception) {
            println("❌ Erreur lors de la création du message: ${e.message}")
            e.printStackTrace()
            try {
                messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/errors",
                    MessageError(
                        code = "MESSAGE_CREATION_ERROR",
                        message = "Erreur lors de la création du message: ${e.message}"
                    )
                )
            } catch (sendError: Exception) {
                println("❌ Impossible d'envoyer l'erreur: ${sendError.message}")
            }
        } finally {
            TokenContext.clear() // ← TOUJOURS nettoyer
        }
    }

    // ==================== TYPING NOTIFICATION ====================

    /**
     * Endpoint pour envoyer une notification de frappe
     *
     * @param roomId ID du salon
     * @param typingNotification Notification contenant userId et isTyping
     */
    @MessageMapping("/chat.typing/{roomId}")
    fun typing(
        @DestinationVariable roomId: String,
        @Payload typingNotification: TypingNotificationDto,
        headerAccessor: SimpMessageHeaderAccessor
    ) {
        println("⌨️ Utilisateur ${typingNotification.userId} tape dans la salle $roomId: ${typingNotification.isTyping}")
        try {
            messagingTemplate.convertAndSend(
                "/topic/room/$roomId/typing",
                typingNotification
            )
            println("✅ Typing notification broadcastée")
        } catch (e: Exception) {
            println("❌ Erreur lors de l'envoi de la notification de frappe: ${e.message}")
        }
    }

    // ==================== USER JOIN/LEAVE ====================

    /**
     * Notifier quand un utilisateur rejoint une salle
     */
    @MessageMapping("/chat.join/{roomId}")
    fun joinRoom(
        @DestinationVariable roomId: String,
        headerAccessor: SimpMessageHeaderAccessor
    ) {
        val sessionAttributes = headerAccessor.sessionAttributes
        val userId = sessionAttributes?.get("userId") as? String
        val token  = sessionAttributes?.get("token")  as? String  // ← token

        if (userId != null) {
            println("👋 Utilisateur $userId a rejoint la salle $roomId")
            TokenContext.set(token) // ← au cas où joinRoom appelle des services Feign
            try {
                messagingTemplate.convertAndSend(
                    "/topic/room/$roomId/activity",
                    UserActivityDto(
                        type = "USER_JOINED",
                        userId = userId,
                        username = "User $userId",
                        roomId = roomId
                    )
                )
                println("✅ Activity notification envoyée")
            } catch (e: Exception) {
                println("❌ Erreur lors de l'envoi de l'activité: ${e.message}")
            } finally {
                TokenContext.clear()
            }
        } else {
            println("⚠️ userId null - impossible de notifier join")
        }
    }

    @MessageMapping("/chat.leave/{roomId}")
    fun leaveRoom(
        @DestinationVariable roomId: String,
        headerAccessor: SimpMessageHeaderAccessor
    ) {
        val sessionAttributes = headerAccessor.sessionAttributes
        val userId = sessionAttributes?.get("userId") as? String

        if (userId != null) {
            println("👋 Utilisateur $userId a quitté la salle $roomId")
            try {
                messagingTemplate.convertAndSend(
                    "/topic/room/$roomId/activity",
                    UserActivityDto(
                        type = "USER_LEFT",
                        userId = userId,
                        username = "User $userId",
                        roomId = roomId
                    )
                )
                println("✅ Activity notification envoyée")
            } catch (e: Exception) {
                println("❌ Erreur lors de l'envoi de l'activité: ${e.message}")
            }
        }
    }

    // ==================== ERROR HANDLING ====================

    // ==================== ERROR HANDLING ====================

    @MessageMapping("/error")
    fun handleError(
        @Payload error: MessageError,
        headerAccessor: SimpMessageHeaderAccessor
    ) {
        println("❌ Erreur reçue: ${error.code} - ${error.message}")
    }

    // ==================== ADD USER ====================

    @MessageMapping("/chat.addUser/{roomId}")
    fun addUser(
        @DestinationVariable roomId: String,
        @Payload userId: String,
        headerAccessor: SimpMessageHeaderAccessor
    ) {
        println("👤 Utilisateur $userId rejoint la salle $roomId")
        val username = headerAccessor.user?.name ?: "Anonymous"
        messagingTemplate.convertAndSend(
            "/topic/room/$roomId/users",
            UserEvent(
                type = "USER_JOINED",
                userId = userId,
                username = username,
                action = "joined the chat"
            )
        )
    }

    // ==================== PRIVATE MESSAGES ====================

    @MessageMapping("/chat.private")
    @SendToUser("/queue/private")
    fun sendPrivateMessage(
        @Payload privateMessageRequest: PrivateMessageRequest,
        principal: Principal
    ): PrivateMessageResponse {
        val senderId = principal.name.toString()
        println("🔒 Message privé de $senderId à ${privateMessageRequest.recipientId}")

        messagingTemplate.convertAndSendToUser(
            privateMessageRequest.recipientId.toString(),
            "/queue/private",
            PrivateMessageResponse(
                senderId = senderId,
                recipientId = privateMessageRequest.recipientId,
                content = privateMessageRequest.content,
                timestamp = System.currentTimeMillis()
            )
        )

        return PrivateMessageResponse(
            senderId = senderId,
            recipientId = privateMessageRequest.recipientId,
            content = privateMessageRequest.content,
            timestamp = System.currentTimeMillis(),
            status = "sent"
        )
    }

    @MessageMapping("/chat.message.read/{messageId}")
    fun messageRead(
        @DestinationVariable messageId: String,
        @Payload readByUserId: String,
        principal: Principal
    ) {
        val senderId = principal.name.toLong()
        println("👁️ Message $messageId lu par $readByUserId")
        messagingTemplate.convertAndSendToUser(
            senderId.toString(),
            "/queue/messages/read",
            MessageReadNotification(messageId, readByUserId, System.currentTimeMillis())
        )
    }

    //============= Endpoints WebSocket OneToOne Conversation  ===============

//    @MessageMapping("/private/typing/{senderId}/{receiverId}")
//    fun handleTypingIndicator(
//        @DestinationVariable senderId: String,
//        @DestinationVariable receiverId: String,
//        @Payload isTyping: Boolean
//    ) {
//        // Vérifier si l'utilisateur existe
//        val sender = usersWebChatInterface.getUserBasicInfo(senderId)
//        if (sender == null) {
//            logger.warn("Sender with ID $senderId not found")
//            return
//        }
//
//        // Vérifier si le destinataire existe
//        val receiver = usersWebChatInterface.getUserById(receiverId)
//        if (receiver == null) {
//            logger.warn("Receiver with ID $receiverId not found")
//            return
//        }
//
//        // Créer la notification de frappe
//        val typingNotification = PrivateDto.TypingNotification(
//            senderId = senderId,
//            senderName = sender.email,
//            receiverId = receiverId,
//            isTyping = isTyping,
//            timestamp = LocalDateTime.now()
//        )
//
//        // Envoyer la notification au destinataire uniquement
//        messagingTemplate.convertAndSend(
//            "/topic/private/typing/${receiverId}",
//            typingNotification
//        )
//
//        // Log pour le débogage
//        if (isTyping) {
//            logger.info("User $senderId is typing to $receiverId")
//        } else {
//            logger.info("User $senderId stopped typing to $receiverId")
//        }
//    }

    /**
     * Handles typing notifications in private chats
     * Client sends to: /app/private/typing/{userId}
     * Server broadcasts to: /topic/private/typing/{otherUserId}
     */
    @MessageMapping("/private/send/{senderId}")
    @SendToUser("/queue/private/confirmation")
    fun sendPrivateMessage(
        @DestinationVariable senderId: String,
        @Payload request: PrivateDto.PrivateChatRequest,
        headerAccessor: SimpMessageHeaderAccessor
    ): PrivateChatService.PrivateChatNotification {
        val token = headerAccessor.sessionAttributes?.get("token") as? String
        TokenContext.set(token)
        return try {
            val response = privateChatService.sendMessage(senderId, request)
            PrivateChatService.PrivateChatNotification(
                messageId = response.id,
                senderId = response.senderId1,
                senderName = response.senderName1,
                content = response.content,
                timestamp = response.timestamp,
                isOwnMessage = true
            )
        } finally {
            TokenContext.clear()
        }
    }

    @MessageMapping("/private/typing/{userId}")
    fun handlePrivateTyping(
        @DestinationVariable userId: String,
        @Payload payload: TypingPayload,
        principal: Principal
    ) {
        val senderId = principal.name.toString()
        val receiverId = payload.userId

        val typingNotification = TypingNotification(
            userId = senderId,
            isTyping = payload.isTyping,
            timestamp = System.currentTimeMillis()
        )

        messagingTemplate.convertAndSend(
            "/topic/private/typing/$receiverId",
            typingNotification
        )

        if (payload.isTyping) {
            privateChatService.setUserTyping(senderId, receiverId)
        } else {
            privateChatService.removeUserTyping(senderId, receiverId)
        }
    }

    @MessageMapping("/private/read/{userId}")
    fun markMessagesAsRead(
        @DestinationVariable userId: String,
        @Payload messageIds: List<String>
    ) {
        val request = PrivateDto.MarkAsReadRequest(messageIds = messageIds)
        privateChatService.markMessagesAsRead(userId, request)
    }

    /**
     * Handle file upload via WebSocket
     * This is for small files only (WebSocket has message size limits)
     */


    private fun sendError(userId: String, message: String) {
        val error = mapOf(
            "error" to true,
            "message" to message,
            "timestamp" to System.currentTimeMillis()
        )

        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/errors",
            error
        )
    }

    // ==================== DATA CLASSES ====================

    /**
     * Événement de message (pour la diffusion publique)
     */
    data class MessageEvent(
        val type: String,
        val message: MessageDto.MessageResponse,
        val timestamp: Long = System.currentTimeMillis()
    )

    /**
     * Confirmation d'envoi de message
     */
    data class MessageConfirmation(
        val messageId: String,
        val status: String,
        val content: String
    )

    /**
     * Erreur WebSocket
     */
    data class MessageError(
        val code: String,
        val message: String,
        val timestamp: Long = System.currentTimeMillis()
    )

    /**
     * Événement utilisateur (join/leave)
     */
    data class UserEvent(
        val type: String,
        val userId: String,
        val username: String,
        val action: String,
        val timestamp: Long = System.currentTimeMillis()
    )

    /**
     * Demande de saisie
     */
    data class TypingRequest(
        val userId: String,
        val isTyping: Boolean
    )

    /**
     * Notification de saisie
     */
    data class TypingNotification(
        val userId: String,
        val isTyping: Boolean,
        val timestamp: Long = System.currentTimeMillis()
    )

    /**
     * Demande de message privé
     */
    data class PrivateMessageRequest(
        val recipientId: String,
        val content: String
    )

    /**
     * Réponse de message privé
     */
    data class PrivateMessageResponse(
        val senderId: String,
        val recipientId: String,
        val content: String,
        val timestamp: Long,
        val status: String = "received"
    )

    /**
     * Notification de lecture
     */
    data class MessageReadNotification(
        val messageId: String,
        val readByUserId: String,
        val readAt: Long
    )

    data class TypingNotificationDto(
        val userId: String,
        val isTyping: Boolean,
        val roomId: String? = null
    )

    data class UserActivityDto(
        val type: String, // USER_JOINED, USER_LEFT
        val userId: String,
        val username: String?,
        val roomId: String
    )

    data class TypingPayload(
        val userId: String,
        val isTyping: Boolean
    )

//    data class TypingNotification(
//        val userId: String,
//        val isTyping: Boolean,
//        val timestamp: String
//    )

}
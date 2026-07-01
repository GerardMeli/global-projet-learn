package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.PrivateDto
import com.reli237.web_application_chat.service.PrivateChatService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/private-chat")
@Tag(name = "Private Chat", description = "One-to-one private messaging between users")
class PrivateChatController(
    private val privateChatService: PrivateChatService
) {


    // ═══════════════════════════════════════════════════════════
    // MESSAGES TEXTE
    // ═══════════════════════════════════════════════════════════

    /**
     * Envoyer un message texte à un autre utilisateur
     * Header X-User-Id : ID de l'expéditeur (injecté par le gateway)
     */
    @PostMapping("/send/{senderId}")
    @Operation(summary = "Send private message", description = "Sends a one-to-one text message to another user")
    fun sendMessage(
        @PathVariable senderId: String,
        @RequestBody request: PrivateDto.PrivateChatRequest
    ): ResponseEntity<PrivateDto.PrivateChatResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(privateChatService.sendMessage(senderId, request))
    }

    /**
     * Récupérer la conversation entre deux utilisateurs (ordonnée chronologiquement)
     */
    @GetMapping("/chat/{userId1}/{userId2}")
    @Operation(summary = "Get conversation", description = "Retrieves the full message history between two specific users")
    fun getChatBetweenUsers(
        @PathVariable userId1: String,
        @PathVariable userId2: String
    ): ResponseEntity<List<PrivateDto.PrivateChatResponse>> {
        return ResponseEntity.ok(privateChatService.getChatBetweenUserResponse(userId1, userId2))
    }

    /**
     * Récupérer toutes les conversations d'un utilisateur
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all user chats", description = "Lists all private conversations involving a specific user")
    fun getUserChats(
        @PathVariable userId: String
    ): ResponseEntity<List<PrivateDto.PrivateChatResponse>> {
        return ResponseEntity.ok(privateChatService.getUserChats(userId))
    }

    /**
     * Récupérer tous les contacts d'un utilisateur
     * (utilisateurs avec qui il a déjà échangé des messages)
     */
    @GetMapping("/contacts/{userId}")
    @Operation(summary = "Get user contacts", description = "Lists all users with whom the specified user has exchanged messages")
    fun getUserContacts(
        @PathVariable userId: String
    ): ResponseEntity<List<PrivateChatService.UserContactDTO>> {
        return ResponseEntity.ok(privateChatService.getUserContacts(userId))
    }

    /**
     * Récupérer tous les chats privés (admin)
     */
    @GetMapping("/all")
    @Operation(summary = "Get all private chats", description = "Lists all private messages across the entire system (Admin only)")
    fun getAllPrivateChats(): ResponseEntity<List<PrivateDto.PrivateChatResponse>> {
        return ResponseEntity.ok(privateChatService.getAllPrivateChats())
    }

    // ═══════════════════════════════════════════════════════════
    // LECTURE / NON-LU
    // ═══════════════════════════════════════════════════════════

    /**
     * Marquer des messages comme lus
     */
    @PostMapping("/mark-read/{userId}")
    @Operation(summary = "Mark messages as read", description = "Updates the read status of multiple private messages")
    fun markMessagesAsRead(
        @PathVariable userId: String,
        @RequestBody request: PrivateDto.MarkAsReadRequest
    ): ResponseEntity<Void> {
        privateChatService.markMessagesAsRead(userId, request)
        return ResponseEntity.noContent().build()
    }

    /**
     * Récupérer le nombre de messages non lus pour un utilisateur
     */
    @GetMapping("/unread-count/{userId}")
    @Operation(summary = "Get unread count", description = "Returns the number of unread private messages for a user")
    fun getUnreadCount(
        @PathVariable userId: String
    ): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(mapOf("unreadCount" to privateChatService.getUnreadCount(userId)))
    }

    // ═══════════════════════════════════════════════════════════
    // FICHIERS
    // ═══════════════════════════════════════════════════════════

    /**
     * Envoyer un fichier dans un chat privé
     * Utilise multipart/form-data : champ "file" + champ "receiverId" + champ optionnel "description"
     */
    @PostMapping("/send-file/{senderId}", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @Operation(summary = "Send private file", description = "Uploads and sends a file to another user")
    fun sendFile(
        @PathVariable senderId: String,
        @RequestParam("receiverId") receiverId: String,
        @RequestParam("file") file: MultipartFile,
        @RequestParam("description", defaultValue = "") description: String
    ): ResponseEntity<PrivateDto.PrivateFileResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(privateChatService.sendFile(senderId, receiverId, file, description))
    }

    /**
     * Récupérer tous les fichiers échangés entre deux utilisateurs
     */
    @GetMapping("/files/{userId1}/{userId2}")
    @Operation(summary = "Get shared files", description = "Lists all files exchanged between two specific users")
    fun getFilesBetweenUsers(
        @PathVariable userId1: String,
        @PathVariable userId2: String
    ): ResponseEntity<List<PrivateDto.PrivateFileResponse>> {
        return ResponseEntity.ok(privateChatService.getFilesBetweenUsers(userId1, userId2))
    }

    /**
     * Supprimer un message de type fichier (soft delete)
     */
    @DeleteMapping("/files/{messageId}")
    @Operation(summary = "Delete file message", description = "Soft deletes a file message from a private chat")
    fun deleteFileMessage(
        @PathVariable messageId: String
    ): ResponseEntity<PrivateDto.PrivateFileResponse> {
        return ResponseEntity.ok(privateChatService.deleteFileMessage(messageId))
    }

    /**
     * REST endpoint to get users currently typing
     */
    @GetMapping("/typing/{receiverId}")
    @Operation(summary = "Get typing status", description = "Retrieves information about users currently typing to the specified receiver")
    fun getTypingUsers(@PathVariable receiverId: String): ResponseEntity<List<PrivateChatService.UserTypingStatus>> {
        val typingUsers = privateChatService.getTypingUsers(receiverId)
        return ResponseEntity.ok(typingUsers)
    }

    // ═══════════════════════════════════════════════════════════
    // GESTION DES ERREURS
    // ═══════════════════════════════════════════════════════════

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(
        ex: IllegalArgumentException
    ): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(mapOf("error" to (ex.message ?: "Invalid request")))
    }

    @ExceptionHandler(IllegalStateException::class)
    fun handleIllegalStateException(
        ex: IllegalStateException
    ): ResponseEntity<Map<String, String>> {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(mapOf("error" to (ex.message ?: "Internal server error")))
    }

}
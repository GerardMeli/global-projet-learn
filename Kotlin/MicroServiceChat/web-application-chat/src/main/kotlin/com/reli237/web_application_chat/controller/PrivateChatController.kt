package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.PrivateDto
import com.reli237.web_application_chat.service.PrivateChatService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/private-chat")
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
    fun sendMessage(
        @PathVariable senderId: Long,
        @RequestBody request: PrivateDto.PrivateChatRequest
    ): ResponseEntity<PrivateDto.PrivateChatResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(privateChatService.sendMessage(senderId, request))
    }

    /**
     * Récupérer la conversation entre deux utilisateurs (ordonnée chronologiquement)
     */
    @GetMapping("/chat/{userId1}/{userId2}")
    fun getChatBetweenUsers(
        @PathVariable userId1: Long,
        @PathVariable userId2: Long
    ): ResponseEntity<List<PrivateDto.PrivateChatResponse>> {
        return ResponseEntity.ok(privateChatService.getChatBetweenUserResponse(userId1, userId2))
    }

    /**
     * Récupérer toutes les conversations d'un utilisateur
     */
    @GetMapping("/user/{userId}")
    fun getUserChats(
        @PathVariable userId: Long
    ): ResponseEntity<List<PrivateDto.PrivateChatResponse>> {
        return ResponseEntity.ok(privateChatService.getUserChats(userId))
    }

    /**
     * Récupérer tous les contacts d'un utilisateur
     * (utilisateurs avec qui il a déjà échangé des messages)
     */
    @GetMapping("/contacts/{userId}")
    fun getUserContacts(
        @PathVariable userId: Long
    ): ResponseEntity<List<PrivateChatService.UserContactDTO>> {
        return ResponseEntity.ok(privateChatService.getUserContacts(userId))
    }

    /**
     * Récupérer tous les chats privés (admin)
     */
    @GetMapping("/all")
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
    fun markMessagesAsRead(
        @PathVariable userId: Long,
        @RequestBody request: PrivateDto.MarkAsReadRequest
    ): ResponseEntity<Void> {
        privateChatService.markMessagesAsRead(userId, request)
        return ResponseEntity.noContent().build()
    }

    /**
     * Récupérer le nombre de messages non lus pour un utilisateur
     */
    @GetMapping("/unread-count/{userId}")
    fun getUnreadCount(
        @PathVariable userId: Long
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
    fun sendFile(
        @PathVariable senderId: Long,
        @RequestParam("receiverId") receiverId: Long,
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
    fun getFilesBetweenUsers(
        @PathVariable userId1: Long,
        @PathVariable userId2: Long
    ): ResponseEntity<List<PrivateDto.PrivateFileResponse>> {
        return ResponseEntity.ok(privateChatService.getFilesBetweenUsers(userId1, userId2))
    }

    /**
     * Supprimer un message de type fichier (soft delete)
     */
    @DeleteMapping("/files/{messageId}")
    fun deleteFileMessage(
        @PathVariable messageId: Long
    ): ResponseEntity<PrivateDto.PrivateFileResponse> {
        return ResponseEntity.ok(privateChatService.deleteFileMessage(messageId))
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
package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.PrivateDto
import com.reli237.web_application_chat.model.PrivateChat
import com.reli237.web_application_chat.service.PrivateChatService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/private-chat")
class PrivateChatController(
    private val privateChatService: PrivateChatService
) {

    @PostMapping("/send/{senderId}")
    fun sendMessage(
        @PathVariable senderId: Long,
        @RequestBody request: PrivateDto.PrivateChatRequest
    ): ResponseEntity<PrivateDto.PrivateChatResponse> {
        val response = privateChatService.sendMessage(senderId, request)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/chat/{userId1}/{userId2}")
    fun getChatBetweenUsers(
        @PathVariable userId1: Long,
        @PathVariable userId2: Long
    ): ResponseEntity<List<PrivateDto.PrivateChatResponse>> {
        val chat = privateChatService.getChatBetweenUsers(userId1, userId2)
        return ResponseEntity.ok(chat)
    }

    @GetMapping("/user/{userId}")
    fun getUserChats(@PathVariable userId: Long): ResponseEntity<List<PrivateDto.PrivateChatResponse>> {
        val chats = privateChatService.getUserChats(userId)
        return ResponseEntity.ok(chats)
    }

    @GetMapping("/contacts/{userId}")
    fun getUserContacts(@PathVariable userId: Long): ResponseEntity<List<PrivateChatService.UserContactDTO>> {
        val contacts = privateChatService.getUserContacts(userId)
        return ResponseEntity.ok(contacts)
    }

    @PostMapping("/mark-read/{userId}")
    fun markMessagesAsRead(
        @PathVariable userId: Long,
        @RequestBody request: PrivateDto.MarkAsReadRequest
    ): ResponseEntity<Void> {
        privateChatService.markMessagesAsRead(userId, request)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/unread-count/{userId}")
    fun getUnreadCount(@PathVariable userId: Long): ResponseEntity<Map<String, Long>> {
        val count = privateChatService.getUnreadCount(userId)
        return ResponseEntity.ok(mapOf("unreadCount" to count))
    }

    @GetMapping("/private-chats")
    fun getAllPrivateChats(): ResponseEntity<List<PrivateDto.PrivateChatResponse>> {
        val chats = privateChatService.getAllPrivateChats()
        return ResponseEntity.ok(chats)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.message)
    }
}
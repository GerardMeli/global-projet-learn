package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.ChatRoomDto
import com.reli237.web_application_chat.service.ChatRoomService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/chat-rooms")
class ChatRoomController (
    private val chatRoomService: ChatRoomService
) {

    @PostMapping
    fun createChatRoom(
        @RequestBody request: ChatRoomDto.ChatRoomCreateRequest
    ): ResponseEntity<ChatRoomDto.ChatRoomResponse> {
        return ResponseEntity.ok(chatRoomService.createChatRoom(request))
    }

    @GetMapping
    fun getAllChatRooms(): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.getAllChatRooms())
    }

    @GetMapping("/{id}")
    fun getChatRoomById(
        @PathVariable id: Long
    ): ResponseEntity<ChatRoomDto.ChatRoomDetailResponse> {
        return ResponseEntity.ok(chatRoomService.getChatRoomById(id))
    }

    @GetMapping("/search")
    fun searchChatRooms(
        @RequestParam name: String
    ): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.searchChatRoomsByName(name))
    }

    @GetMapping("/public")
    fun getAllPublicChatRooms(): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.getAllPublicChatRooms())
    }

    @GetMapping("/private")
    fun getAllPrivateChatRooms(): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.getAllPrivateChatRooms())
    }

    @PutMapping("/{id}")
    fun updateChatRoom(
        @PathVariable id: Long,
        @RequestBody request: ChatRoomDto.ChatRoomUpdateRequest
    ): ResponseEntity<ChatRoomDto.ChatRoomResponse> {
        return ResponseEntity.ok(chatRoomService.updateChatRoom(id, request))
    }

    @DeleteMapping("/{id}")
    fun deleteChatRoom(@PathVariable id: Long): ResponseEntity<Void> {
        chatRoomService.deleteChatRoom(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{roomId}/messages/count")
    fun getMessageCount(
        @PathVariable roomId: Long
    ): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(mapOf("messageCount" to chatRoomService.getMessageCount(roomId)))
    }

    @DeleteMapping("/{roomId}/participants/{userId}")
    fun removeParticipantFromRoom(
        @PathVariable roomId: Long,
        @PathVariable userId: Long
    ): ResponseEntity<ChatRoomDto.ChatRoomDetailResponse> {
        return ResponseEntity.ok(chatRoomService.removeParticipant(roomId, userId))
    }
}
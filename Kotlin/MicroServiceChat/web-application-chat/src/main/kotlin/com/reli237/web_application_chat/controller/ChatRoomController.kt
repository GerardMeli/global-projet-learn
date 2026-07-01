package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.ChatRoomDto
import com.reli237.web_application_chat.service.ChatRoomService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
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
@Tag(name = "Chat Rooms", description = "Management of public and private chat rooms")
class ChatRoomController (
    private val chatRoomService: ChatRoomService
) {

    @PostMapping
    @Operation(summary = "Create a chat room", description = "Creates a new public or private chat room")
    fun createChatRoom(
        @RequestBody request: ChatRoomDto.ChatRoomCreateRequest
    ): ResponseEntity<ChatRoomDto.ChatRoomResponse> {
        return ResponseEntity.ok(chatRoomService.createChatRoom(request))
    }

    @GetMapping
    @Operation(summary = "Get all chat rooms", description = "Retrieves a list of all existing chat rooms")
    fun getAllChatRooms(): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.getAllChatRooms())
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get chat room by ID", description = "Retrieves detailed information about a specific chat room")
    fun getChatRoomById(
        @PathVariable id: String
    ): ResponseEntity<ChatRoomDto.ChatRoomDetailResponse> {
        return ResponseEntity.ok(chatRoomService.getChatRoomById(id))
    }

    @GetMapping("/search")
    @Operation(summary = "Search chat rooms", description = "Searches for chat rooms by name")
    fun searchChatRooms(
        @RequestParam name: String
    ): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.searchChatRoomsByName(name))
    }

    @GetMapping("/public")
    @Operation(summary = "Get all public chat rooms", description = "Lists all chat rooms marked as public")
    fun getAllPublicChatRooms(): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.getAllPublicChatRooms())
    }

    @GetMapping("/private")
    @Operation(summary = "Get all private chat rooms", description = "Lists all chat rooms marked as private")
    fun getAllPrivateChatRooms(): ResponseEntity<List<ChatRoomDto.ChatRoomResponse>> {
        return ResponseEntity.ok(chatRoomService.getAllPrivateChatRooms())
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update chat room", description = "Updates details (name, description, etc.) of an existing chat room")
    fun updateChatRoom(
        @PathVariable id: String,
        @RequestBody request: ChatRoomDto.ChatRoomUpdateRequest
    ): ResponseEntity<ChatRoomDto.ChatRoomResponse> {
        return ResponseEntity.ok(chatRoomService.updateChatRoom(id, request))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete chat room", description = "Permanently deletes a chat room")
    fun deleteChatRoom(@PathVariable id: String): ResponseEntity<Void> {
        chatRoomService.deleteChatRoom(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{roomId}/messages/count")
    @Operation(summary = "Get message count", description = "Returns the total number of messages in a specific chat room")
    fun getMessageCount(
        @PathVariable roomId: String
    ): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(mapOf("messageCount" to chatRoomService.getMessageCount(roomId)))
    }

    @DeleteMapping("/{roomId}/participants/{userId}")
    @Operation(summary = "Remove participant from room", description = "Removes a specific user from a chat room")
    fun removeParticipantFromRoom(
        @PathVariable roomId: String,
        @PathVariable userId: String
    ): ResponseEntity<ChatRoomDto.ChatRoomDetailResponse> {
        return ResponseEntity.ok(chatRoomService.removeParticipant(roomId, userId))
    }
}
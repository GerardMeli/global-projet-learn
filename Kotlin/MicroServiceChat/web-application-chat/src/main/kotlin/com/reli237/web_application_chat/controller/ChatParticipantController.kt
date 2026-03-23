package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.ChatParticipantDto
import com.reli237.web_application_chat.model.ParticipantRole
import com.reli237.web_application_chat.service.ChatParticipantService
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
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/chat-participant")
@Tag(name = "Chat Participants", description = "Management of participants in chat rooms")
class ChatParticipantController(
    private val chatParticipantService: ChatParticipantService
) {

    @PostMapping("/participants")
    @Operation(summary = "Add a participant", description = "Adds a user to a specific chat room")
    fun addParticipant(
        @RequestBody request: ChatParticipantDto.ChatParticipantCreateRequest
    ): ResponseEntity<ChatParticipantDto.ChatParticipantResponse> {
        return ResponseEntity.ok(chatParticipantService.addParticipant(request))
    }

    @GetMapping("/participants/{id}")
    @Operation(summary = "Get participant by ID", description = "Retrieves detailed information about a participant by their unique ID")
    fun getParticipantById(
        @PathVariable id: String
    ): ResponseEntity<ChatParticipantDto.ChatParticipantDetailResponse> {
        return ResponseEntity.ok(chatParticipantService.getParticipantById(id))
    }

    @GetMapping("/rooms/{roomId}/participants")
    @Operation(summary = "Get participants by room", description = "Lists all participants in a specific chat room")
    fun getParticipantsByRoom(
        @PathVariable roomId: String
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getParticipantsByChatRoom(roomId))
    }

    @GetMapping("/users/{userId}/rooms")
    @Operation(summary = "Get user's rooms", description = "Lists all chat rooms a user is part of")
    fun getRoomsForUser(
        @PathVariable userId: String
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getChatRoomsForUser(userId))
    }

    @GetMapping("/rooms/{roomId}/participants/role/{role}")
    @Operation(summary = "Get participants by role", description = "Lists participants with a specific role in a chat room")
    fun getParticipantsByRoleInRoom(
        @PathVariable roomId: String,
        @PathVariable role: ParticipantRole
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getParticipantsByRoleInChatRoom(roomId, role))
    }

    @PutMapping("/participants/{participantId}/role")
    @Operation(summary = "Update participant role", description = "Updates the role of a participant (Admin, Moderator, Member)")
    fun updateParticipantRole(
        @PathVariable participantId: String,
        @RequestBody request: ChatParticipantDto.ChatParticipantUpdateRequest
    ): ResponseEntity<ChatParticipantDto.ChatParticipantResponse> {
        return ResponseEntity.ok(chatParticipantService.updateParticipantRole(participantId, request))
    }

    @DeleteMapping("/participants/{participantId}")
    @Operation(summary = "Remove participant", description = "Removes a participant from a room by participant ID")
    fun removeParticipant(@PathVariable participantId: String): ResponseEntity<Void> {
        chatParticipantService.removeParticipant(participantId)
        return ResponseEntity.noContent().build()
    }

    // === Endpoints utilitaires liés aux participants ===

    @GetMapping("/rooms/{roomId}/participants/count")
    @Operation(summary = "Count participants", description = "Returns the total number of participants in a chat room")
    fun countParticipants(
        @PathVariable roomId: String
    ): ResponseEntity<Long> {
        return ResponseEntity.ok(chatParticipantService.countParticipantsInChatRoom(roomId))
    }

    @GetMapping("/users/{userId}/is-participant/{roomId}")
    @Operation(summary = "Check if user is participant", description = "Checks if a user belongs to a chat room")
    fun isUserParticipant(
        @PathVariable userId: String,
        @PathVariable roomId: String
    ): ResponseEntity<Boolean> {
        return ResponseEntity.ok(chatParticipantService.isUserParticipant(userId, roomId))
    }

    @GetMapping("/users/{userId}/is-admin/{roomId}")
    @Operation(summary = "Check if user is admin", description = "Checks if a user has admin privileges in a chat room")
    fun isUserAdmin(
        @PathVariable userId: String,
        @PathVariable roomId: String
    ): ResponseEntity<Boolean> {
        return ResponseEntity.ok(chatParticipantService.isUserAdmin(userId, roomId))
    }

    @GetMapping("/participants")
    @Operation(summary = "Get all participants", description = "Lists all participants across all rooms (Admin only)")
    fun getAllParticipants(): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getAllParticipants())
    }

    @GetMapping("/users/{userId}/rooms/count")
    @Operation(summary = "Count user's rooms", description = "Returns the number of chat rooms a user is part of")
    fun countChatRoomsForUser(
        @PathVariable userId: String
    ): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(mapOf("count" to chatParticipantService.countChatRoomsForUser(userId)))
    }

    @GetMapping("/users/{userId}/is-moderator/{roomId}")
    @Operation(summary = "Check if user is moderator", description = "Checks if a user has moderator privileges in a chat room")
    fun isUserModerator(
        @PathVariable userId: String,
        @PathVariable roomId: String
    ): ResponseEntity<Boolean> {
        return ResponseEntity.ok(chatParticipantService.isUserModerator(userId, roomId))
    }

    // Supprimer par userId + roomId (complément de DELETE /participants/{participantId})
    @DeleteMapping("/rooms/{roomId}/participants/user/{userId}")
    @Operation(summary = "Remove user from room", description = "Removes a user from a room using their user ID and room ID")
    fun removeParticipantByUser(
        @PathVariable roomId: String,
        @PathVariable userId: String
    ): ResponseEntity<Void> {
        chatParticipantService.removeParticipant(userId, roomId)
        return ResponseEntity.noContent().build()
    }

    // Mettre à jour le rôle par userId + roomId
    @PutMapping("/rooms/{roomId}/participants/user/{userId}/role")
    @Operation(summary = "Update user role in room", description = "Updates the role of a user in a specific room")
    fun updateParticipantRoleByUser(
        @PathVariable roomId: String,
        @PathVariable userId: String,
        @RequestBody request: ChatParticipantDto.ChatParticipantUpdateRequest
    ): ResponseEntity<ChatParticipantDto.ChatParticipantResponse> {
        return ResponseEntity.ok(chatParticipantService.updateParticipantRole(userId, roomId, request))
    }

    @GetMapping("/rooms/{roomId}/participants/members")
    @Operation(summary = "Get room members", description = "Lists only standard members (not admins/mods) in a room")
    fun getMembersInRoom(
        @PathVariable roomId: String
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getMembersInChatRoom(roomId))
    }

    // Récupérer un participant précis par userId + roomId
    @GetMapping("/rooms/{roomId}/participants/user/{userId}")
    @Operation(summary = "Get specific participant", description = "Retrieves participant details for a specific user in a room")
    fun getParticipant(
        @PathVariable roomId: String,
        @PathVariable userId: String
    ): ResponseEntity<ChatParticipantDto.ChatParticipantResponse> {
        return ResponseEntity.ok(chatParticipantService.getParticipant(userId, roomId))
    }

    @GetMapping("/participants/role/{role}")
    @Operation(summary = "Get all participants by role", description = "Lists all participants with a specific role across all rooms")
    fun getParticipantsByRole(
        @PathVariable role: ParticipantRole
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getParticipantsByRole(role))
    }

}
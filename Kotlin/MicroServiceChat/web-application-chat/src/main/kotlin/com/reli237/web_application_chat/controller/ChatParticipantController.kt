package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.ChatParticipantDto
import com.reli237.web_application_chat.model.ParticipantRole
import com.reli237.web_application_chat.service.ChatParticipantService
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
class ChatParticipantController(
    private val chatParticipantService: ChatParticipantService
) {

    @PostMapping("/participants")
    fun addParticipant(
        @RequestBody request: ChatParticipantDto.ChatParticipantCreateRequest
    ): ResponseEntity<ChatParticipantDto.ChatParticipantResponse> {
        return ResponseEntity.ok(chatParticipantService.addParticipant(request))
    }

    @GetMapping("/participants/{id}")
    fun getParticipantById(
        @PathVariable id: Long
    ): ResponseEntity<ChatParticipantDto.ChatParticipantDetailResponse> {
        return ResponseEntity.ok(chatParticipantService.getParticipantById(id))
    }

    @GetMapping("/rooms/{roomId}/participants")
    fun getParticipantsByRoom(
        @PathVariable roomId: Long
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getParticipantsByChatRoom(roomId))
    }

    @GetMapping("/users/{userId}/rooms")
    fun getRoomsForUser(
        @PathVariable userId: Long
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
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

    // === Endpoints utilitaires liés aux participants ===

    @GetMapping("/rooms/{roomId}/participants/count")
    fun countParticipants(
        @PathVariable roomId: Long
    ): ResponseEntity<Long> {
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

    @GetMapping("/participants")
    fun getAllParticipants(): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getAllParticipants())
    }

    @GetMapping("/users/{userId}/rooms/count")
    fun countChatRoomsForUser(
        @PathVariable userId: Long
    ): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(mapOf("count" to chatParticipantService.countChatRoomsForUser(userId)))
    }

    @GetMapping("/users/{userId}/is-moderator/{roomId}")
    fun isUserModerator(
        @PathVariable userId: Long,
        @PathVariable roomId: Long
    ): ResponseEntity<Boolean> {
        return ResponseEntity.ok(chatParticipantService.isUserModerator(userId, roomId))
    }

    // Supprimer par userId + roomId (complément de DELETE /participants/{participantId})
    @DeleteMapping("/rooms/{roomId}/participants/user/{userId}")
    fun removeParticipantByUser(
        @PathVariable roomId: Long,
        @PathVariable userId: Long
    ): ResponseEntity<Void> {
        chatParticipantService.removeParticipant(userId, roomId)
        return ResponseEntity.noContent().build()
    }

    // Mettre à jour le rôle par userId + roomId
    @PutMapping("/rooms/{roomId}/participants/user/{userId}/role")
    fun updateParticipantRoleByUser(
        @PathVariable roomId: Long,
        @PathVariable userId: Long,
        @RequestBody request: ChatParticipantDto.ChatParticipantUpdateRequest
    ): ResponseEntity<ChatParticipantDto.ChatParticipantResponse> {
        return ResponseEntity.ok(chatParticipantService.updateParticipantRole(userId, roomId, request))
    }

    @GetMapping("/rooms/{roomId}/participants/members")
    fun getMembersInRoom(
        @PathVariable roomId: Long
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getMembersInChatRoom(roomId))
    }

    // Récupérer un participant précis par userId + roomId
    @GetMapping("/rooms/{roomId}/participants/user/{userId}")
    fun getParticipant(
        @PathVariable roomId: Long,
        @PathVariable userId: Long
    ): ResponseEntity<ChatParticipantDto.ChatParticipantResponse> {
        return ResponseEntity.ok(chatParticipantService.getParticipant(userId, roomId))
    }

    @GetMapping("/participants/role/{role}")
    fun getParticipantsByRole(
        @PathVariable role: ParticipantRole
    ): ResponseEntity<List<ChatParticipantDto.ChatParticipantResponse>> {
        return ResponseEntity.ok(chatParticipantService.getParticipantsByRole(role))
    }

}
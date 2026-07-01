package com.reli237.web_application_chat.service

import com.reli237.web_application_chat.dto.ChatParticipantDto
import com.reli237.web_application_chat.dto.ChatRoomDto
import com.reli237.web_application_chat.dto.UserDto
import com.reli237.web_application_chat.feign.UsersWebChatInterface
import com.reli237.web_application_chat.model.ChatParticipant
import com.reli237.web_application_chat.model.ParticipantRole
import com.reli237.web_application_chat.repository.ChatParticipantRepository
import com.reli237.web_application_chat.repository.ChatRoomRepository
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class ChatParticipantService(
    private val chatParticipantRepository: ChatParticipantRepository,
    private val chatRoomRepository: ChatRoomRepository,
    private val usersWebChatInterface: UsersWebChatInterface
) {

    private fun <T> ResponseEntity<T>.getBodyOrThrow(errorMessage: String): T {
        if (!this.statusCode.is2xxSuccessful || this.body == null) throw IllegalArgumentException(errorMessage)
        return this.body!!
    }

    // ═══════════════════════════════════════════════════════════
    // CRUD PARTICIPANTS
    // ═══════════════════════════════════════════════════════════

    fun addParticipant(request: ChatParticipantDto.ChatParticipantCreateRequest): ChatParticipantDto.ChatParticipantResponse {
        usersWebChatInterface.getUserBasicInfo(request.userId).getBodyOrThrow("User not found with id: ${request.userId}")
        val chatRoom = chatRoomRepository.findById(request.chatRoomId)
            .orElseThrow { IllegalArgumentException("Chat room not found with id: ${request.chatRoomId}") }
        if (chatParticipantRepository.findByUserIdAndChatRoomId(request.userId, request.chatRoomId).isPresent)
            throw IllegalArgumentException("User is already a participant in this chat room")

        val saved = chatParticipantRepository.save(
            ChatParticipant(
                id = "", userId = request.userId, chatRoom = chatRoom,
                joinedAt = LocalDateTime.now(), role = request.role)
        )
        return mapToResponse(saved)
    }

    fun getParticipantById(id: String): ChatParticipantDto.ChatParticipantDetailResponse =
        mapToDetailResponse(findParticipantById(id))

    fun getAllParticipants(): List<ChatParticipantDto.ChatParticipantResponse> =
        chatParticipantRepository.findAll().map { mapToResponse(it) }

    /** Supprimer par participantId */
    fun removeParticipant(participantId: String) {
        if (!chatParticipantRepository.existsById(participantId))
            throw IllegalArgumentException("Participant not found with id: $participantId")
        chatParticipantRepository.deleteById(participantId)
    }

    /** Supprimer par userId + chatRoomId */
    fun removeParticipant(userId: String, chatRoomId: String) {
        chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            .orElseThrow { IllegalArgumentException("Participant not found for user $userId in chat room $chatRoomId") }
        chatParticipantRepository.deleteByUserIdAndChatRoomId(userId, chatRoomId)
    }

    // ═══════════════════════════════════════════════════════════
    // REQUÊTES
    // ═══════════════════════════════════════════════════════════

    fun getParticipantsByChatRoom(chatRoomId: String): List<ChatParticipantDto.ChatParticipantResponse> {
        chatRoomRepository.findById(chatRoomId)
            .orElseThrow { IllegalArgumentException("Chat room not found with id: $chatRoomId") }
        return chatParticipantRepository.findByChatRoomId(chatRoomId).map { mapToResponse(it) }
    }

    fun getChatRoomsForUser(userId: String): List<ChatParticipantDto.ChatParticipantResponse> {
        usersWebChatInterface.getUserBasicInfo(userId).getBodyOrThrow("User not found with id: $userId")
        return chatParticipantRepository.findByUserId(userId).map { mapToResponse(it) }
    }

    fun getParticipant(userId: String, chatRoomId: String): ChatParticipantDto.ChatParticipantResponse =
        mapToResponse(findParticipantByUserAndRoom(userId, chatRoomId))

    /**
     * Récupère les participants par rôle dans une salle.
     * ✅ getAdminsInChatRoom + getModeratorsInChatRoom + getMembersInChatRoom SUPPRIMÉS
     *    → ce sont de simples alias, utilisez getParticipantsByRoleInChatRoom(id, ADMIN/MODERATOR/MEMBER)
     */
    fun getParticipantsByRoleInChatRoom(chatRoomId: String, role: ParticipantRole): List<ChatParticipantDto.ChatParticipantResponse> {
        chatRoomRepository.findById(chatRoomId)
            .orElseThrow { IllegalArgumentException("Chat room not found with id: $chatRoomId") }
        return chatParticipantRepository.findByChatRoomIdAndRole(chatRoomId, role).map { mapToResponse(it) }
    }

    /**
     * Raccourci conservé pour getMembersInChatRoom (utilisé dans ChatRoomController).
     * Délègue vers getParticipantsByRoleInChatRoom.
     */
    fun getMembersInChatRoom(chatRoomId: String): List<ChatParticipantDto.ChatParticipantResponse> =
        getParticipantsByRoleInChatRoom(chatRoomId, ParticipantRole.MEMBER)

    fun getParticipantsByRole(role: ParticipantRole): List<ChatParticipantDto.ChatParticipantResponse> =
        chatParticipantRepository.findByRole(role).map { mapToResponse(it) }

    // ═══════════════════════════════════════════════════════════
    // MISE À JOUR DU RÔLE
    // ═══════════════════════════════════════════════════════════

    /** Mettre à jour le rôle par participantId */
    fun updateParticipantRole(participantId: String, request: ChatParticipantDto.ChatParticipantUpdateRequest): ChatParticipantDto.ChatParticipantResponse {
        val saved = chatParticipantRepository.save(findParticipantById(participantId).copy(role = request.role))
        return mapToResponse(saved)
    }

    /** Mettre à jour le rôle par userId + chatRoomId */
    fun updateParticipantRole(userId: String, chatRoomId: String, request: ChatParticipantDto.ChatParticipantUpdateRequest): ChatParticipantDto.ChatParticipantResponse {
        val saved = chatParticipantRepository.save(findParticipantByUserAndRoom(userId, chatRoomId).copy(role = request.role))
        return mapToResponse(saved)
    }

    // ═══════════════════════════════════════════════════════════
    // VÉRIFICATIONS / COMPTAGES
    // ═══════════════════════════════════════════════════════════

    fun isUserParticipant(userId: String, chatRoomId: String): Boolean =
        chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId).isPresent

    fun isUserAdmin(userId: String, chatRoomId: String): Boolean =
        chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            .map { it.role == ParticipantRole.ADMIN }.orElse(false)

    fun isUserModerator(userId: String, chatRoomId: String): Boolean =
        chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            .map { it.role == ParticipantRole.MODERATOR }.orElse(false)

    fun countParticipantsInChatRoom(chatRoomId: String): Long =
        chatParticipantRepository.countByChatRoomId(chatRoomId)

    fun countChatRoomsForUser(userId: String): Long =
        chatParticipantRepository.countByUserId(userId)

    // ═══════════════════════════════════════════════════════════
    // MAPPERS PRIVÉS
    // ═══════════════════════════════════════════════════════════

    private fun findParticipantById(id: String): ChatParticipant =
        chatParticipantRepository.findById(id).orElseThrow { IllegalArgumentException("Participant not found with id: $id") }

    private fun findParticipantByUserAndRoom(userId: String, chatRoomId: String): ChatParticipant =
        chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            .orElseThrow { IllegalArgumentException("Participant not found for user $userId in chat room $chatRoomId") }

    private fun mapToResponse(participant: ChatParticipant): ChatParticipantDto.ChatParticipantResponse {
        val user = usersWebChatInterface.getUserBasicInfo(participant.userId)
            .getBodyOrThrow("User not found with id: ${participant.userId}")
        return ChatParticipantDto.ChatParticipantResponse(
            id = participant.id,
            user = UserDto.UserSimpleResponse(id = user.id, email = user.email),
            chatRoomId = participant.chatRoom.id,
            joinedAt = participant.joinedAt, role = participant.role
        )
    }

    private fun mapToDetailResponse(participant: ChatParticipant): ChatParticipantDto.ChatParticipantDetailResponse {
        val user = usersWebChatInterface.getUserBasicInfo(participant.userId)
            .getBodyOrThrow("User not found with id: ${participant.userId}")
        return ChatParticipantDto.ChatParticipantDetailResponse(
            id = participant.id, user = user,
            chatRoom = ChatRoomDto.ChatRoomResponse(
                id = participant.chatRoom.id, name = participant.chatRoom.name,
                type = participant.chatRoom.type, participantCount = participant.chatRoom.participants.size
            ),
            joinedAt = participant.joinedAt, role = participant.role
        )
    }

}
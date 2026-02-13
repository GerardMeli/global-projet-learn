package com.reli237.web_application_chat.service

import com.reli237.web_application_chat.dto.ChatParticipantDto
import com.reli237.web_application_chat.dto.ChatRoomDto
import com.reli237.web_application_chat.dto.UserDto
import com.reli237.web_application_chat.model.ChatParticipant
import com.reli237.web_application_chat.model.ParticipantRole
import com.reli237.web_application_chat.repository.ChatParticipantRepository
import com.reli237.web_application_chat.repository.ChatRoomRepository
import com.reli237.web_application_chat.repository.UsersRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class ChatParticipantService(
    private val chatParticipantRepository: ChatParticipantRepository,
    private val chatRoomRepository: ChatRoomRepository,
    private val usersRepository: UsersRepository
) {

    /**
     * Add a participant to a chat room
     */
    fun addParticipant(request: ChatParticipantDto.ChatParticipantCreateRequest): ChatParticipantDto.ChatParticipantResponse {
        val user = usersRepository.findById(request.userId)
            .orElseThrow { throw IllegalArgumentException("User not found with id: ${request.userId}") }

        val chatRoom = chatRoomRepository.findById(request.chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with id: ${request.chatRoomId}") }

        // Check if participant already exists
        val existingParticipant = chatParticipantRepository.findByUserIdAndChatRoomId(request.userId, request.chatRoomId)
        if (existingParticipant.isPresent) {
            throw IllegalArgumentException("User is already a participant in this chat room")
        }

        val participant = ChatParticipant(
            id = 0,
            user = user,
            chatRoom = chatRoom,
            joinedAt = LocalDateTime.now(),
            role = request.role
        )

        val savedParticipant = chatParticipantRepository.save(participant)
        return mapToChatParticipantResponse(savedParticipant)
    }

    /**
     * Get participant by ID
     */
    fun getParticipantById(id: Long): ChatParticipantDto.ChatParticipantDetailResponse {
        val participant = chatParticipantRepository.findById(id)
            .orElseThrow { throw IllegalArgumentException("Participant not found with id: $id") }

        return mapToChatParticipantDetailResponse(participant)
    }

    /**
     * Get all participants in a chat room
     */
    fun getParticipantsByChatRoom(chatRoomId: Long): List<ChatParticipantDto.ChatParticipantResponse> {
        val chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with id: $chatRoomId") }

        return chatParticipantRepository.findByChatRoomId(chatRoomId)
            .map { mapToChatParticipantResponse(it) }
    }

    /**
     * Get all chat rooms for a user
     */
    fun getChatRoomsForUser(userId: Long): List<ChatParticipantDto.ChatParticipantResponse> {
        val user = usersRepository.findById(userId)
            .orElseThrow { throw IllegalArgumentException("User not found with id: $userId") }

        return chatParticipantRepository.findByUserId(userId)
            .map { mapToChatParticipantResponse(it) }
    }

    /**
     * Get participant by user and chat room
     */
    fun getParticipant(userId: Long, chatRoomId: Long): ChatParticipantDto.ChatParticipantResponse {
        val participant = chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Participant not found for user $userId in chat room $chatRoomId") }

        return mapToChatParticipantResponse(participant)
    }

    /**
     * Get all participants with a specific role
     */
    fun getParticipantsByRole(role: ParticipantRole): List<ChatParticipantDto.ChatParticipantResponse> {
        return chatParticipantRepository.findByRole(role)
            .map { mapToChatParticipantResponse(it) }
    }

    /**
     * Get all participants with a specific role in a chat room
     */
    fun getParticipantsByRoleInChatRoom(chatRoomId: Long, role: ParticipantRole): List<ChatParticipantDto.ChatParticipantResponse> {
        val chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with id: $chatRoomId") }

        return chatParticipantRepository.findByChatRoomIdAndRole(chatRoomId, role)
            .map { mapToChatParticipantResponse(it) }
    }

    /**
     * Get all admins in a chat room
     */
    fun getAdminsInChatRoom(chatRoomId: Long): List<ChatParticipantDto.ChatParticipantResponse> {
        return getParticipantsByRoleInChatRoom(chatRoomId, ParticipantRole.ADMIN)
    }

    /**
     * Get all moderators in a chat room
     */
    fun getModeratorsInChatRoom(chatRoomId: Long): List<ChatParticipantDto.ChatParticipantResponse> {
        return getParticipantsByRoleInChatRoom(chatRoomId, ParticipantRole.MODERATOR)
    }

    /**
     * Get all members in a chat room
     */
    fun getMembersInChatRoom(chatRoomId: Long): List<ChatParticipantDto.ChatParticipantResponse> {
        return getParticipantsByRoleInChatRoom(chatRoomId, ParticipantRole.MEMBER)
    }

    /**
     * Update participant role
     */
    fun updateParticipantRole(participantId: Long, request: ChatParticipantDto.ChatParticipantUpdateRequest): ChatParticipantDto.ChatParticipantResponse {
        val participant = chatParticipantRepository.findById(participantId)
            .orElseThrow { throw IllegalArgumentException("Participant not found with id: $participantId") }

        val updatedParticipant = participant.copy(role = request.role)
        val savedParticipant = chatParticipantRepository.save(updatedParticipant)
        return mapToChatParticipantResponse(savedParticipant)
    }

    /**
     * Update participant role by user and chat room
     */
    fun updateParticipantRole(userId: Long, chatRoomId: Long, request: ChatParticipantDto.ChatParticipantUpdateRequest): ChatParticipantDto.ChatParticipantResponse {
        val participant = chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Participant not found for user $userId in chat room $chatRoomId") }

        val updatedParticipant = participant.copy(role = request.role)
        val savedParticipant = chatParticipantRepository.save(updatedParticipant)
        return mapToChatParticipantResponse(savedParticipant)
    }

    /**
     * Remove participant from chat room
     */
    fun removeParticipant(participantId: Long) {
        if (!chatParticipantRepository.existsById(participantId)) {
            throw IllegalArgumentException("Participant not found with id: $participantId")
        }
        chatParticipantRepository.deleteById(participantId)
    }

    /**
     * Remove participant by user and chat room
     */
    fun removeParticipant(userId: Long, chatRoomId: Long) {
        val participant = chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Participant not found for user $userId in chat room $chatRoomId") }

        chatParticipantRepository.deleteByUserIdAndChatRoomId(userId, chatRoomId)
    }

    /**
     * Check if user is participant of chat room
     */
    fun isUserParticipant(userId: Long, chatRoomId: Long): Boolean {
        return chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId).isPresent
    }

    /**
     * Check if user is admin in chat room
     */
    fun isUserAdmin(userId: Long, chatRoomId: Long): Boolean {
        val participant = chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
        return participant.isPresent && participant.get().role == ParticipantRole.ADMIN
    }

    /**
     * Check if user is moderator in chat room
     */
    fun isUserModerator(userId: Long, chatRoomId: Long): Boolean {
        val participant = chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
        return participant.isPresent && participant.get().role == ParticipantRole.MODERATOR
    }

    /**
     * Count participants in a chat room
     */
    fun countParticipantsInChatRoom(chatRoomId: Long): Long {
        return chatParticipantRepository.countByChatRoomId(chatRoomId)
    }

    /**
     * Count chat rooms for a user
     */
    fun countChatRoomsForUser(userId: Long): Long {
        return chatParticipantRepository.countByUserId(userId)
    }

    /**
     * Get all participants
     */
    fun getAllParticipants(): List<ChatParticipantDto.ChatParticipantResponse> {
        return chatParticipantRepository.findAll()
            .map { mapToChatParticipantResponse(it) }
    }

    /**
     * Map ChatParticipant entity to ChatParticipantResponse DTO
     */
    private fun mapToChatParticipantResponse(participant: ChatParticipant): ChatParticipantDto.ChatParticipantResponse {
        return ChatParticipantDto.ChatParticipantResponse(
            id = participant.id,
            user = UserDto.UserSimpleResponse(
                id = participant.user.id,
                email = participant.user.email
            ),
            chatRoomId = participant.chatRoom.id,
            joinedAt = participant.joinedAt,
            role = participant.role
        )
    }

    /**
     * Map ChatParticipant entity to ChatParticipantDetailResponse DTO
     */
    private fun mapToChatParticipantDetailResponse(participant: ChatParticipant): ChatParticipantDto.ChatParticipantDetailResponse {
        return ChatParticipantDto.ChatParticipantDetailResponse(
            id = participant.id,
            user = UserDto.UserResponse(
                id = participant.user.id,
                email = participant.user.email,
                role = participant.user.role,
                isActive = participant.user.isActive,
                createdAt = participant.user.createdAt
            ),
            chatRoom = ChatRoomDto.ChatRoomResponse(
                id = participant.chatRoom.id,
                name = participant.chatRoom.name,
                type = participant.chatRoom.type,
                participantCount = participant.chatRoom.participants.size
            ),
            joinedAt = participant.joinedAt,
            role = participant.role
        )
    }

}
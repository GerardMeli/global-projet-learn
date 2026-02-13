package com.reli237.web_application_chat.service

import com.reli237.web_application_chat.dto.ChatRoomDto
import com.reli237.web_application_chat.dto.MessageDto
import com.reli237.web_application_chat.model.ChatParticipant
import com.reli237.web_application_chat.model.ChatRoom
import com.reli237.web_application_chat.model.ChatRoomType
import com.reli237.web_application_chat.repository.ChatParticipantRepository
import com.reli237.web_application_chat.repository.ChatRoomRepository
import com.reli237.web_application_chat.repository.UsersRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional


@Service
@Transactional
class ChatRoomService(
    private val chatRoomRepository: ChatRoomRepository,
    private val chatParticipantRepository: ChatParticipantRepository,
    private val usersRepository: UsersRepository,
    private val messageService: MessageService
) {

    /**
     * Create a new chat room
     */
    fun createChatRoom(request: ChatRoomDto.ChatRoomCreateRequest): ChatRoomDto.ChatRoomResponse {
        if (request.name.isBlank()) {
            throw IllegalArgumentException("Chat room name cannot be empty")
        }

        val existingRoom = chatRoomRepository.findByName(request.name)
        if (existingRoom.isPresent) {
            throw IllegalArgumentException("Chat room with name '${request.name}' already exists")
        }

        val chatRoom = ChatRoom(
            id = 0,
            name = request.name,
            type = request.type,
            participants = mutableListOf(),
            messages = mutableListOf()
        )

        val savedChatRoom = chatRoomRepository.save(chatRoom)

        // Add participants if provided
        if (request.userIds.isNotEmpty()) {
            addParticipants(savedChatRoom.id, request.userIds)
        }

        return mapToChatRoomResponse(savedChatRoom)
    }

    /**
     * Get chat room by ID
     */
    fun getChatRoomById(id: Long): ChatRoomDto.ChatRoomDetailResponse {
        val chatRoom = chatRoomRepository.findById(id)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with id: $id") }

        return mapToChatRoomDetailResponse(chatRoom)
    }

    /**
     * Get chat room by name
     */
    fun getChatRoomByName(name: String): ChatRoomDto.ChatRoomResponse {
        val chatRoom = chatRoomRepository.findByName(name)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with name: $name") }

        return mapToChatRoomResponse(chatRoom)
    }

    /**
     * Get all chat rooms
     */
    fun getAllChatRooms(): List<ChatRoomDto.ChatRoomResponse> {
        return chatRoomRepository.findAll()
            .map { mapToChatRoomResponse(it) }
    }

    /**
     * Get chat rooms by type
     */
    fun getChatRoomsByType(type: ChatRoomType): List<ChatRoomDto.ChatRoomResponse> {
        return chatRoomRepository.findByType(type)
            .map { mapToChatRoomResponse(it) }
    }

    /**
     * Get all public chat rooms
     */
    fun getAllPublicChatRooms(): List<ChatRoomDto.ChatRoomResponse> {
        return getChatRoomsByType(ChatRoomType.PUBLIC)
    }

    /**
     * Get all private chat rooms
     */
    fun getAllPrivateChatRooms(): List<ChatRoomDto.ChatRoomResponse> {
        return getChatRoomsByType(ChatRoomType.PRIVATE)
    }

    /**
     * Search chat rooms by name (case-insensitive)
     */
    fun searchChatRoomsByName(name: String): List<ChatRoomDto.ChatRoomResponse> {
        if (name.isBlank()) {
            throw IllegalArgumentException("Search name cannot be empty")
        }

        return chatRoomRepository.findByNameContainingIgnoreCase(name)
            .map { mapToChatRoomResponse(it) }
    }

    /**
     * Update chat room
     */
    fun updateChatRoom(id: Long, request: ChatRoomDto.ChatRoomUpdateRequest): ChatRoomDto.ChatRoomResponse {
        val chatRoom = chatRoomRepository.findById(id)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with id: $id") }

        if (request.name.isBlank()) {
            throw IllegalArgumentException("Chat room name cannot be empty")
        }

        // Check if new name already exists (if different from current name)
        if (request.name != chatRoom.name) {
            val existingRoom = chatRoomRepository.findByName(request.name)
            if (existingRoom.isPresent) {
                throw IllegalArgumentException("Chat room with name '${request.name}' already exists")
            }
        }

        val updatedChatRoom = chatRoom.copy(
            name = request.name,
            type = request.type
        )

        val savedChatRoom = chatRoomRepository.save(updatedChatRoom)
        return mapToChatRoomResponse(savedChatRoom)
    }

    /**
     * Delete chat room
     */
    fun deleteChatRoom(id: Long) {
        if (!chatRoomRepository.existsById(id)) {
            throw IllegalArgumentException("Chat room not found with id: $id")
        }
        chatRoomRepository.deleteById(id)
    }

    /**
     * Add participants to chat room
     */
    fun addParticipants(chatRoomId: Long, userIds: List<Long>): ChatRoomDto.ChatRoomDetailResponse {
        val chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with id: $chatRoomId") }

        if (userIds.isEmpty()) {
            throw IllegalArgumentException("User list cannot be empty")
        }

        for (userId in userIds) {
            val user = usersRepository.findById(userId)
                .orElseThrow { throw IllegalArgumentException("User not found with id: $userId") }

            // Check if participant already exists
            val existingParticipant = chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            if (existingParticipant.isEmpty) {
                val participant = ChatParticipant(
                    id = 0,
                    chatRoom = chatRoom,
                    user = user
                )
                chatParticipantRepository.save(participant)
            }
        }

        // Refresh and return updated chat room
        val refreshedChatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Chat room not found") }

        return mapToChatRoomDetailResponse(refreshedChatRoom)
    }


    /**
     * Remove participant from chat room
     */
    fun removeParticipant(chatRoomId: Long, userId: Long): ChatRoomDto.ChatRoomDetailResponse {
        val chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with id: $chatRoomId") }

        val user = usersRepository.findById(userId)
            .orElseThrow { throw IllegalArgumentException("User not found with id: $userId") }

        val participant = chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Participant not found in this chat room") }

        chatParticipantRepository.deleteByUserIdAndChatRoomId(userId, chatRoomId)

        // Refresh and return updated chat room
        val refreshedChatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Chat room not found") }

        return mapToChatRoomDetailResponse(refreshedChatRoom)
    }

    /**
     * Get participant count for a chat room
     */
    fun getParticipantCount(chatRoomId: Long): Int {
        val chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow { throw IllegalArgumentException("Chat room not found with id: $chatRoomId") }

        return chatRoom.participants.size
    }

    /**
     * Get message count for a chat room
     */
    fun getMessageCount(chatRoomId: Long): Long {
        return messageService.countMessagesByChatRoom(chatRoomId)
    }

    /**
     * Check if user is participant of chat room
     */
    fun isUserParticipant(chatRoomId: Long, userId: Long): Boolean {
        return chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId).isPresent
    }

    /**
     * Get all chat rooms for a specific user
     */
    fun getChatRoomsForUser(userId: Long): List<ChatRoomDto.ChatRoomResponse> {
        val user = usersRepository.findById(userId)
            .orElseThrow { throw IllegalArgumentException("User not found with id: $userId") }

        return chatParticipantRepository.findByUserId(userId)
            .map { mapToChatRoomResponse(it.chatRoom) }
    }

    /**
     * Map ChatRoom entity to ChatRoomResponse DTO
     */
    private fun mapToChatRoomResponse(chatRoom: ChatRoom): ChatRoomDto.ChatRoomResponse {
        return ChatRoomDto.ChatRoomResponse(
            id = chatRoom.id,
            name = chatRoom.name,
            type = chatRoom.type,
            participantCount = chatRoom.participants.size
        )
    }

    /**
     * Map ChatRoom entity to ChatRoomDetailResponse DTO
     */
    private fun mapToChatRoomDetailResponse(chatRoom: ChatRoom): ChatRoomDto.ChatRoomDetailResponse {
        return ChatRoomDto.ChatRoomDetailResponse(
            id = chatRoom.id,
            name = chatRoom.name,
            type = chatRoom.type,
            participants = chatRoom.participants.map { mapToChatParticipantResponse(it) },
            messages = chatRoom.messages
                .filter { !it.isDeleted }
                .map { mapToMessageResponse(it) }
        )
    }

    /**
     * Map ChatParticipant to ChatParticipantResponse DTO
     * Note: Adjust based on your actual ChatParticipantDto structure
     */
    private fun mapToChatParticipantResponse(chatParticipant: ChatParticipant): ChatParticipant {
        // This should return ChatParticipantDto.ChatParticipantResponse
        // Adjust based on your actual ChatParticipant entity and DTO structure
        return chatParticipant
    }

    /**
     * Map Message to MessageResponse DTO
     * Note: Adjust based on your actual MessageDto structure
     */
    private fun mapToMessageResponse(message: Any): MessageDto.MessageResponse {
        // This should properly map Message to MessageDto.MessageResponse
        // For now returning a placeholder
        return message as MessageDto.MessageResponse
    }

}
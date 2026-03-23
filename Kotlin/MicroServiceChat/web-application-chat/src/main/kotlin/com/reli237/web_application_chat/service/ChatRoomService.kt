package com.reli237.web_application_chat.service

import com.reli237.web_application_chat.dto.ChatParticipantDto
import com.reli237.web_application_chat.dto.ChatRoomDto
import com.reli237.web_application_chat.dto.MessageDto
import com.reli237.web_application_chat.dto.UserDto
import com.reli237.web_application_chat.feign.UsersWebChatInterface
import com.reli237.web_application_chat.model.ChatParticipant
import com.reli237.web_application_chat.model.ChatRoom
import com.reli237.web_application_chat.model.ChatRoomType
import com.reli237.web_application_chat.model.Message
import com.reli237.web_application_chat.model.ParticipantRole
import com.reli237.web_application_chat.repository.ChatParticipantRepository
import com.reli237.web_application_chat.repository.ChatRoomRepository
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import kotlin.Long


@Service
@Transactional
class ChatRoomService(
    private val chatRoomRepository: ChatRoomRepository,
    private val chatParticipantRepository: ChatParticipantRepository,
    private val usersWebChatInterface: UsersWebChatInterface,
    private val messageService: MessageService
) {

    private fun <T> ResponseEntity<T>.getBodyOrThrow(errorMessage: String): T {
        if (!this.statusCode.is2xxSuccessful || this.body == null) throw IllegalArgumentException(errorMessage)
        return this.body!!
    }

    // ═══════════════════════════════════════════════════════════
    // CRUD SALLES
    // ═══════════════════════════════════════════════════════════

    fun createChatRoom(request: ChatRoomDto.ChatRoomCreateRequest): ChatRoomDto.ChatRoomResponse {
        if (request.name.isBlank()) throw IllegalArgumentException("Chat room name cannot be empty")
        if (chatRoomRepository.findByName(request.name).isPresent)
            throw IllegalArgumentException("Chat room with name '${request.name}' already exists")

        val saved = chatRoomRepository.save(
            ChatRoom(id = "", name = request.name, type = request.type,
                participants = mutableListOf(), messages = mutableListOf())
        )
        if (request.userIds.isNotEmpty()) addParticipants(saved.id, request.userIds)
        return mapToChatRoomResponse(saved)
    }

    fun getChatRoomById(id: String): ChatRoomDto.ChatRoomDetailResponse =
        mapToChatRoomDetailResponse(findRoomById(id))

    fun getAllChatRooms(): List<ChatRoomDto.ChatRoomResponse> =
        chatRoomRepository.findAll().map { mapToChatRoomResponse(it) }

    fun getChatRoomsByType(type: ChatRoomType): List<ChatRoomDto.ChatRoomResponse> =
        chatRoomRepository.findByType(type).map { mapToChatRoomResponse(it) }

    fun getAllPublicChatRooms(): List<ChatRoomDto.ChatRoomResponse> = getChatRoomsByType(ChatRoomType.PUBLIC)
    fun getAllPrivateChatRooms(): List<ChatRoomDto.ChatRoomResponse> = getChatRoomsByType(ChatRoomType.PRIVATE)

    fun searchChatRoomsByName(name: String): List<ChatRoomDto.ChatRoomResponse> {
        if (name.isBlank()) throw IllegalArgumentException("Search name cannot be empty")
        return chatRoomRepository.findByNameContainingIgnoreCase(name).map { mapToChatRoomResponse(it) }
    }

    fun updateChatRoom(id: String, request: ChatRoomDto.ChatRoomUpdateRequest): ChatRoomDto.ChatRoomResponse {
        val chatRoom = findRoomById(id)
        if (request.name.isBlank()) throw IllegalArgumentException("Chat room name cannot be empty")
        if (request.name != chatRoom.name && chatRoomRepository.findByName(request.name).isPresent)
            throw IllegalArgumentException("Chat room with name '${request.name}' already exists")
        return mapToChatRoomResponse(chatRoomRepository.save(chatRoom.copy(name = request.name, type = request.type)))
    }

    fun deleteChatRoom(id: String) {
        if (!chatRoomRepository.existsById(id)) throw IllegalArgumentException("Chat room not found with id: $id")
        chatRoomRepository.deleteById(id)
    }

    // ═══════════════════════════════════════════════════════════
    // GESTION DES PARTICIPANTS
    // ═══════════════════════════════════════════════════════════

    fun addParticipants(chatRoomId: String, userIds: List<String>): ChatRoomDto.ChatRoomDetailResponse {
        val chatRoom = findRoomById(chatRoomId)
        if (userIds.isEmpty()) throw IllegalArgumentException("User list cannot be empty")

        userIds.forEach { userId ->
            usersWebChatInterface.getUserBasicInfo(userId).getBodyOrThrow("User not found with id: $userId")
            if (chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId).isEmpty) {
                chatParticipantRepository.save(
                    ChatParticipant(
                        id = "", userId = userId, chatRoom = chatRoom,
                        joinedAt = LocalDateTime.now(), role = ParticipantRole.MEMBER)
                )
            }
        }
        return mapToChatRoomDetailResponse(findRoomById(chatRoomId))
    }

    fun removeParticipant(chatRoomId: String, userId: String): ChatRoomDto.ChatRoomDetailResponse {
        findRoomById(chatRoomId)
        usersWebChatInterface.getUserBasicInfo(userId).getBodyOrThrow("User not found with id: $userId")
        chatParticipantRepository.findByUserIdAndChatRoomId(userId, chatRoomId)
            .orElseThrow { IllegalArgumentException("Participant not found in this chat room") }
        chatParticipantRepository.deleteByUserIdAndChatRoomId(userId, chatRoomId)
        return mapToChatRoomDetailResponse(findRoomById(chatRoomId))
    }

    // ═══════════════════════════════════════════════════════════
    // STATISTIQUES
    // ✅ getParticipantCount SUPPRIMÉ — doublon de ChatParticipantService.countParticipantsInChatRoom
    // ✅ isUserParticipant SUPPRIMÉ  — doublon de ChatParticipantService.isUserParticipant
    // ═══════════════════════════════════════════════════════════

    fun getMessageCount(chatRoomId: String): Long = messageService.countMessagesByChatRoom(chatRoomId)

    // ═══════════════════════════════════════════════════════════
    // MAPPERS PRIVÉS
    // ═══════════════════════════════════════════════════════════

    private fun findRoomById(id: String): ChatRoom =
        chatRoomRepository.findById(id).orElseThrow { IllegalArgumentException("Chat room not found with id: $id") }

    private fun mapToChatRoomResponse(chatRoom: ChatRoom): ChatRoomDto.ChatRoomResponse =
        ChatRoomDto.ChatRoomResponse(
            id = chatRoom.id, name = chatRoom.name,
            type = chatRoom.type, participantCount = chatRoom.participants.size
        )

    private fun mapToChatRoomDetailResponse(chatRoom: ChatRoom): ChatRoomDto.ChatRoomDetailResponse =
        ChatRoomDto.ChatRoomDetailResponse(
            id = chatRoom.id, name = chatRoom.name, type = chatRoom.type,
            participants = chatRoom.participants.map { mapToChatParticipantResponse(it) },
            messages = chatRoom.messages.filter { !it.isDeleted }.map { mapToMessageResponse(it) }
        )

    private fun mapToChatParticipantResponse(participant: ChatParticipant): ChatParticipantDto.ChatParticipantResponse {
        val user = usersWebChatInterface.getUserBasicInfo(participant.userId)
            .getBodyOrThrow("User not found with id: ${participant.userId}")
        return ChatParticipantDto.ChatParticipantResponse(
            id = participant.id,
            user = UserDto.UserSimpleResponse(id = user.id, email = user.email),
            chatRoomId = participant.chatRoom.id,
            joinedAt = participant.joinedAt, role = participant.role
        )
    }

    private fun mapToMessageResponse(message: Message): MessageDto.MessageResponse {
        val sender = usersWebChatInterface.getUserBasicInfo(message.senderId)
            .getBodyOrThrow("User not found with id: ${message.senderId}")
        return MessageDto.MessageResponse(
            id = message.id, content = message.content,
            sender = UserDto.UserSimpleResponse(id = sender.id, email = sender.email),
            chatRoomId = message.chatRoom.id, timestamp = message.timeStamp,
            messageType = message.messageType, isDeleted = message.isDeleted
        )
    }

}
package com.reli237.web_application_chat.dto

import com.reli237.web_application_chat.model.ChatParticipant
import com.reli237.web_application_chat.model.ChatRoomType

class ChatRoomDto {

    // Request DTOs
    data class ChatRoomCreateRequest(
        val name: String,
        val type: ChatRoomType = ChatRoomType.PRIVATE,
        val userIds: List<Long> = emptyList()
    )

    data class ChatRoomUpdateRequest(
        val name: String,
        val type: ChatRoomType
    )

    // Response DTOs
    data class ChatRoomResponse(
        val id: Long,
        val name: String,
        val type: ChatRoomType,
        val participantCount: Int
    )

    data class ChatRoomDetailResponse(
        val id: Long,
        val name: String,
        val type: ChatRoomType,
        val participants: List<ChatParticipant> = emptyList(),
        val messages: List<MessageDto.MessageResponse> = emptyList()
    )

}
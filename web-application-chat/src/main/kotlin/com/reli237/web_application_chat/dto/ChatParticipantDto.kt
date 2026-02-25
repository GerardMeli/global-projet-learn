package com.reli237.web_application_chat.dto

import com.reli237.web_application_chat.model.ParticipantRole
import java.time.LocalDateTime

class ChatParticipantDto {

    //Request DTOs
    data class ChatParticipantCreateRequest(
        val userId: Long,
        val chatRoomId: Long,
        val role: ParticipantRole = ParticipantRole.MEMBER
    )

    data class ChatParticipantUpdateRequest(
        val role: ParticipantRole
    )

    // Response DTOs
    data class ChatParticipantResponse(
        val id: Long,
        val user: UserDto.UserSimpleResponse,
        val chatRoomId: Long,
        val joinedAt: LocalDateTime,
        val role: ParticipantRole
    )

   data class ChatParticipantDetailResponse(
       val id: Long,
       val user: UserDto.UserResponse,
       val chatRoom: ChatRoomDto.ChatRoomResponse,
       val joinedAt: LocalDateTime,
       val role: ParticipantRole
    )

}
package com.reli237.web_application_chat.dto

import com.reli237.web_application_chat.model.ChatParticipant
import com.reli237.web_application_chat.model.UserRole
import java.time.LocalDateTime

class UserDto {

    // Request DTOs
    data class UserCreateRequest(
        val email: String,
        val password: String,
        val role: UserRole = UserRole.USER
    )

    data class UserLoginRequest(
        val email: String,
        val password: String
    )

    data class UserUpdateRequest(
        val isActive: Boolean,
        val password: String
    )

    // Response DTOs
    data class UserResponse(
        val id: Long,
        val email: String,
        val role: UserRole,
        val isActive: Boolean,
        val createdAt: LocalDateTime
    )

    data class UserSimpleResponse(
        val id: Long,
        val email: String
    )

    data class UserDetailResponse(
        val id: Long,
        val email: String,
        val isActive: Boolean,
        val role: UserRole,
        val createdAt: LocalDateTime,
        val chatParticipants: List<ChatParticipant> = emptyList()
    )

    data class PrivateUserResponse(
        val id: Long,
        val email: String,
        val isActive: Boolean,
        val role: String
    )

    data class SearchRequest(
        val query: String
    )


}
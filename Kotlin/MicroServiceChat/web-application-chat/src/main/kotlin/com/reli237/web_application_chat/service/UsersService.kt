package com.reli237.web_application_chat.service

import com.reli237.web_application_chat.config.SecurityConfig
import com.reli237.web_application_chat.dto.UserDto
import com.reli237.web_application_chat.model.ChatParticipant
import com.reli237.web_application_chat.model.UserRole
import com.reli237.web_application_chat.model.Users
import com.reli237.web_application_chat.repository.UsersRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class UsersService(
    private val usersRepository: UsersRepository,
    private val securityConfig: SecurityConfig
) {


    /**
     * Create a new user with email and password
     */
    fun createUser(request: UserDto.UserCreateRequest): UserDto.UserResponse {
        // Check if user already exists
        if (usersRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("User with email ${request.email} already exists")
        }

        val user = Users(
            id = 0,
            email = request.email,
            password = securityConfig.passwordEncoder().encode(request.password),
            role = request.role,
            isActive = true
        )

        val savedUser = usersRepository.save(user)
        return mapToUserResponse(savedUser)
    }

    /**
     * Authenticate user with email and password
     */
    fun authenticateUser(request: UserDto.UserLoginRequest): UserDto.UserResponse {
        val user = usersRepository.findByEmail(request.email)
            .orElseThrow { throw IllegalArgumentException("User not found with email: ${request.email}") }

        if (!user.isActive) {
            throw IllegalStateException("User account is inactive")
        }

        if (!securityConfig.passwordEncoder().matches(request.password, user.password)) {
            throw IllegalArgumentException("Invalid password")
        }

        return mapToUserResponse(user)
    }

    /**
     * Get user by ID
     */
    fun getUserById(id: Long): UserDto.UserDetailResponse {
        val user = usersRepository.findById(id)
            .orElseThrow { throw IllegalArgumentException("User not found with id: $id") }

        return mapToUserDetailResponse(user)
    }

    /**
     * Get user by email
     */
    fun getUserByEmail(email: String): UserDto.UserResponse {
        val user = usersRepository.findByEmail(email)
            .orElseThrow { throw IllegalArgumentException("User not found with email: $email") }

        return mapToUserResponse(user)
    }

    /**
     * Get all active users
     */
    fun getAllActiveUsers(): List<UserDto.UserResponse> {
        return usersRepository.findByIsActiveTrue()
            .map { mapToUserResponse(it) }
    }

    /**
     * Get users by role
     */
    fun getUsersByRole(role: UserRole): List<UserDto.UserResponse> {
        return usersRepository.findByRole(role)
            .map { mapToUserResponse(it) }
    }

    /**
     * Get users created between two dates
     */
    fun getUsersByDateRange(startDate: LocalDateTime, endDate: LocalDateTime): List<UserDto.UserResponse> {
        return usersRepository.findByCreatedAtBetween(startDate, endDate)
            .map { mapToUserResponse(it) }
    }

    /**
     * Update user status and password
     */
    fun updateUser(id: Long, request: UserDto.UserUpdateRequest): UserDto.UserResponse {
        val user = usersRepository.findById(id)
            .orElseThrow { throw IllegalArgumentException("User not found with id: $id") }

        val updatedUser = user.copy(
            isActive = request.isActive,
            password = securityConfig.passwordEncoder().encode(request.password)
        )

        val savedUser = usersRepository.save(updatedUser)
        return mapToUserResponse(savedUser)
    }

    /**
     * Deactivate user account
     */
    fun deactivateUser(id: Long): UserDto.UserResponse {
        val user = usersRepository.findById(id)
            .orElseThrow { throw IllegalArgumentException("User not found with id: $id") }

        val deactivatedUser = user.copy(isActive = false)
        val savedUser = usersRepository.save(deactivatedUser)
        return mapToUserResponse(savedUser)
    }

    /**
     * Activate user account
     */
    fun activateUser(id: Long): UserDto.UserResponse {
        val user = usersRepository.findById(id)
            .orElseThrow { throw IllegalArgumentException("User not found with id: $id") }

        val activatedUser = user.copy(isActive = true)
        val savedUser = usersRepository.save(activatedUser)
        return mapToUserResponse(savedUser)
    }

    /**
     * Delete user
     */
    fun deleteUser(id: Long) {
        if (!usersRepository.existsById(id)) {
            throw IllegalArgumentException("User not found with id: $id")
        }
        usersRepository.deleteById(id)
    }

    /**
     * Check if email exists
     */
    fun emailExists(email: String): Boolean {
        return usersRepository.existsByEmail(email)
    }

    /**
     * Get all users
     */
    fun getAllUsers(): List<UserDto.UserResponse> {
        return usersRepository.findAll()
            .map { mapToUserResponse(it) }
    }

    fun getAllUsersExceptCurrentUser(
        currentUserId: Long
    ): List<UserDto.PrivateUserResponse> {

        return usersRepository.findAllExceptCurrentUser(currentUserId)
            .map { user ->
                UserDto.PrivateUserResponse(
                    id = user.id,
                    email = user.email,
                    isActive = user.isActive,
                    role = user.role.name // ✅
                )
            }
    }

    fun searchUsers(
        currentUserId: Long,
        query: String
    ): List<UserDto.PrivateUserResponse> {

        return usersRepository.searchUsersExceptCurrentUser(currentUserId, query)
            .map { user ->
                UserDto.PrivateUserResponse(
                    id = user.id,
                    email = user.email,
                    isActive = user.isActive,
                    role = user.role.name // ✅ enum → String
                )
            }
    }

    /**
     * Map Users entity to UserResponse DTO
     */
    private fun mapToUserResponse(user: Users): UserDto.UserResponse {
        return UserDto.UserResponse(
            id = user.id,
            email = user.email,
            role = user.role,
            isActive = user.isActive,
            createdAt = user.createdAt
        )
    }

    /**
     * Map Users entity to UserDetailResponse DTO
     */
    private fun mapToUserDetailResponse(user: Users): UserDto.UserDetailResponse {
        return UserDto.UserDetailResponse(
            id = user.id,
            email = user.email,
            isActive = user.isActive,
            role = user.role,
            createdAt = user.createdAt,
            chatParticipants = user.chatParticipants.map {
                mapToChatParticipantResponse(it)
            }
        )
    }

    /**
     * Map ChatParticipant to ChatParticipantResponse DTO
     * Note: You'll need to import ChatParticipantDto
     */
    private fun mapToChatParticipantResponse(chatParticipant: ChatParticipant): ChatParticipant {
        // This should return ChatParticipantDto.ChatParticipantResponse
        // Adjust based on your actual ChatParticipant entity and DTO structure
        return chatParticipant
    }

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
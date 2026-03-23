package com.example.manage_users.service.interf

import com.example.manage_users.dto.AdminDto
import com.example.manage_users.dto.ProfileDto
import org.springframework.security.core.userdetails.UserDetailsService

interface UsersService : UserDetailsService {
    fun getUserProfile(userId: String): ProfileDto.UserProfileResponse
    fun updateUserProfile(userId: String, request: ProfileDto.UserProfileUpdateRequest): ProfileDto.UserProfileResponse
    fun updateUserPreferences(userId: String, request: ProfileDto.UserPreferencesUpdateRequest): ProfileDto.UserProfileResponse
    fun changePassword(userId: String, request: ProfileDto.PasswordChangeRequest)
    fun requestEmailChange(userId: String, request: ProfileDto.EmailUpdateRequest)
    fun confirmEmailChange(token: String)

    // Admin methods
    fun getAllUsers(): List<ProfileDto.UserProfileResponse>
    fun getUserById(userId: String): ProfileDto.UserProfileResponse
    fun updateUser(userId: String, request: AdminDto.AdminUserUpdateRequest): AdminDto.AdminUserResponse
    fun updateUserStatus(userId: String, request: AdminDto.UserStatusUpdateRequest): AdminDto.AdminUserResponse
    fun updateUserRole(userId: String, request: AdminDto.UserRoleUpdateRequest): AdminDto.AdminUserResponse
    fun deleteUser(userId: String)

    fun getAllUsersExceptCurrentUser(
        currentUserId: String
    ): List<ProfileDto.PrivateUserResponse>

    fun searchUsers(
        currentUserId: String,
        query: String
    ): List<ProfileDto.PrivateUserResponse>

    fun createUser(request: AdminDto.CreateUserRequest): AdminDto.CreateUserResponse
}
package com.example.manage_users.service.interf

import com.example.manage_users.dto.AdminDto
import com.example.manage_users.dto.ProfileDto
import org.springframework.security.core.userdetails.UserDetailsService

interface UsersService : UserDetailsService {
    fun getUserProfile(userId: Long): ProfileDto.UserProfileResponse
    fun updateUserProfile(userId: Long, request: ProfileDto.UserProfileUpdateRequest): ProfileDto.UserProfileResponse
    fun updateUserPreferences(userId: Long, request: ProfileDto.UserPreferencesUpdateRequest): ProfileDto.UserProfileResponse
    fun changePassword(userId: Long, request: ProfileDto.PasswordChangeRequest)
    fun requestEmailChange(userId: Long, request: ProfileDto.EmailUpdateRequest)
    fun confirmEmailChange(userId: Long, token: String)

    // Admin methods
    fun getAllUsers(): List<ProfileDto.UserProfileResponse>
    fun getUserById(userId: Long): ProfileDto.UserProfileResponse
    fun updateUser(userId: Long, request: AdminDto.AdminUserUpdateRequest): AdminDto.AdminUserResponse
    fun updateUserStatus(userId: Long, request: AdminDto.UserStatusUpdateRequest): AdminDto.AdminUserResponse
    fun updateUserRole(userId: Long, request: AdminDto.UserRoleUpdateRequest): AdminDto.AdminUserResponse
    fun deleteUser(userId: Long)

    fun getAllUsersExceptCurrentUser(
        currentUserId: Long
    ): List<ProfileDto.PrivateUserResponse>

    fun searchUsers(
        currentUserId: Long,
        query: String
    ): List<ProfileDto.PrivateUserResponse>
}
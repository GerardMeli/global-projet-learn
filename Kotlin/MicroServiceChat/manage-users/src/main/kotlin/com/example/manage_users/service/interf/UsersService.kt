package com.example.manage_users.service.interf

import com.example.manage_users.dto.AdminDto
import com.example.manage_users.dto.EmailPwdDto
import com.example.manage_users.dto.ProfileDto
import com.example.manage_users.dto.RegistrationDto
import com.example.manage_users.dto.StatisticsDto
import com.example.manage_users.models.Users
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.core.userdetails.UserDetailsService

interface UsersService : UserDetailsService {
    fun getUserProfile(userId: Long): ProfileDto.UserProfileResponse
    fun updateUserProfile(userId: Long, request: ProfileDto.UserProfileUpdateRequest): ProfileDto.UserProfileResponse
    fun updateUserPreferences(userId: Long, request: ProfileDto.UserPreferencesUpdateRequest): ProfileDto.UserProfileResponse
    fun changePassword(userId: Long, request: ProfileDto.PasswordChangeRequest)
    fun requestEmailChange(userId: Long, request: ProfileDto.EmailUpdateRequest)
    fun confirmEmailChange(userId: Long, token: String)

    // Admin methods
    fun getAllUsers(pageable: Pageable): AdminDto.PaginatedUsersResponse
    fun searchUsers(criteria: AdminDto.UserSearchCriteria, pageable: Pageable): AdminDto.PaginatedUsersResponse
    fun getUserById(userId: Long): AdminDto.AdminUserResponse
    fun updateUser(userId: Long, request: AdminDto.AdminUserUpdateRequest): AdminDto.AdminUserResponse
    fun updateUserStatus(userId: Long, request: AdminDto.UserStatusUpdateRequest): AdminDto.AdminUserResponse
    fun updateUserRole(userId: Long, request: AdminDto.UserRoleUpdateRequest): AdminDto.AdminUserResponse
    fun deleteUser(userId: Long)
}
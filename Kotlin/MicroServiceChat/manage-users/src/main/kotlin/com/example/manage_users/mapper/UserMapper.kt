package com.example.manage_users.mapper

import com.example.manage_users.dto.AdminDto
import com.example.manage_users.dto.ProfileDto
import com.example.manage_users.models.Users
import org.springframework.stereotype.Component

@Component
class UserMapper {

    fun toProfileResponse(user: Users): ProfileDto.UserProfileResponse {
        return ProfileDto.UserProfileResponse(
            id = user.id,
            email = user.email,
            firstName = user.firstName,
            lastName = user.lastName,
            phoneNumber = user.phoneNumber,
            address = user.address,
            role = user.role,
            status = user.status,
            isActive = user.isActive,
            emailVerified = user.emailVerified,
            language = user.language,
            theme = user.theme,
            emailNotifications = user.emailNotifications,
            createdAt = user.createdAt,
            failedLoginAttempts = user.failedLoginAttempts
        )
    }

    fun toAdminResponse(user: Users): AdminDto.AdminUserResponse {
        return AdminDto.AdminUserResponse(
            id = user.id,
            email = user.email,
            firstName = user.firstName,
            lastName = user.lastName,
            role = user.role,
            status = user.status,
            isActive = user.isActive,
            emailVerified = user.emailVerified,
            failedLoginAttempts = user.failedLoginAttempts,
            createdAt = user.createdAt,
            lastLoginAt = null,
            phoneNumber = user.phoneNumber,
            address = user.address,
            language = user.language,
            theme = user.theme
        )
    }

    fun updateUserFromRequest(
        user: Users,
        request: AdminDto.AdminUserUpdateRequest
    ): Users {
        request.firstName?.let { user.firstName = it }
        request.lastName?.let { user.lastName = it }
        request.phoneNumber?.let { user.phoneNumber = it }
        request.address?.let { user.address = it }
        request.role?.let { user.role = it }
        request.status?.let { user.status = it }
        request.isActive?.let { user.isActive = it }
        request.emailVerified?.let { user.emailVerified = it }
        request.failedLoginAttempts?.let { user.failedLoginAttempts = it }
        request.language?.let { user.language = it }
        request.theme?.let { user.theme = it }
        request.emailNotifications?.let { user.emailNotifications = it }
        return user
    }


}
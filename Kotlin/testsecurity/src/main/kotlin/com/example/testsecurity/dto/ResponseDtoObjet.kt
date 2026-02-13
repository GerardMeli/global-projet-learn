package com.example.testsecurity.dto

import java.time.Instant

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String? = null,
    val tokenType: String = "Bearer",
    val expiresIn: Long? = null,
    val user: UserProfileResponse? = null  // Optional: include user info in auth response
)

data class UserResponse(
    val id: Long,
    val email: String,
    val roles: String, // <- change from List<String> to List<RoleResponse>
    val enabled: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class UserProfileResponse(
    val id: Long,  // Changed from String to Long
    val email: String,
    val roles: String  // Role names for simple profile view
)

data class RoleResponse(
    val id: String,  // UUID as String
    val name: String,
    val createdAt: Instant
)

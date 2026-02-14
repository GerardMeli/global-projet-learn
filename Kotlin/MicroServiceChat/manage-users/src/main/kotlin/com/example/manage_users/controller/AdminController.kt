package com.example.manage_users.controller

import com.example.manage_users.dto.AdminDto
import com.example.manage_users.dto.ProfileDto
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.UsersService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
class AdminController (
    private val userService: UsersService,
    private val jwtProvider: JwtProvider
) {

    @GetMapping("/")
    fun getAllUsers(request: HttpServletRequest): ResponseEntity<ApiResponse<List<ProfileDto.UserProfileResponse>>> {
        return try {
            // Extract and validate JWT token
            val token = extractTokenFromRequest(request)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse(
                        success = false,
                        message = "Authorization token is required",
                        data = null
                    ))

            if (!jwtProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse(
                        success = false,
                        message = "Invalid or expired token",
                        data = null
                    ))
            }

            // Fetch all users
            val users = userService.getAllUsers()
            ResponseEntity.ok()
                .body(ApiResponse(
                    success = true,
                    message = "Users retrieved successfully",
                    data = users
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "Failed to retrieve users: ${e.message}",
                    data = null
                ))
        }
    }

    @GetMapping("/search/{currentUserId}")
    fun searchUsers(
        @PathVariable currentUserId: Long,
        @RequestParam query: String
    ): ResponseEntity<List<ProfileDto.PrivateUserResponse>?> {
        val users = userService.searchUsers(currentUserId, query)
        return ResponseEntity.ok(users)
    }


    @GetMapping("/{userId}")
    fun getUserById(@PathVariable userId: Long): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.getUserById(userId)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{userId}")
    fun updateUser(
        @PathVariable userId: Long,
        @Valid @RequestBody request: AdminDto.AdminUserUpdateRequest
    ): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.updateUser(userId, request)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/{userId}/status")
    fun updateUserStatus(
        @PathVariable userId: Long,
        @Valid @RequestBody request: AdminDto.UserStatusUpdateRequest
    ): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.updateUserStatus(userId, request)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/{userId}/role")
    fun updateUserRole(
        @PathVariable userId: Long,
        @Valid @RequestBody request: AdminDto.UserRoleUpdateRequest
    ): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.updateUserRole(userId, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{userId}")
    fun deleteUser(@PathVariable userId: Long): ResponseEntity<Void> {
        userService.deleteUser(userId)
        return ResponseEntity.noContent().build()
    }


    private fun extractTokenFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else {
            null
        }
    }

}

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?,
    val timestamp: Long = System.currentTimeMillis()
)

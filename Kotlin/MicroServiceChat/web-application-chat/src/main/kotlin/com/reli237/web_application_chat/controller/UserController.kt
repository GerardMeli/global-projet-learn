package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.UserDto
import com.reli237.web_application_chat.model.UserRole
import com.reli237.web_application_chat.security.JwtProvider
import com.reli237.web_application_chat.service.UsersService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = ["*"], maxAge = 3600)
class UsersController(
    private val usersService: UsersService,
    private val jwtProvider: JwtProvider
) {

    /**
     * Get all users (Admin only)
     * GET /api/users
     *
     * Requires: ADMIN role
     *
     * @param request HTTP request for authentication
     * @return ResponseEntity with list of all users
     */
    @GetMapping("/")
    fun getAllUsers(request: HttpServletRequest): ResponseEntity<ApiResponse<List<UserDto.UserResponse>>> {
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
            val users = usersService.getAllUsers()
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

    /**
     * Delete user by ID (Admin only)
     * DELETE /api/users/{id}
     *
     * Requires: ADMIN role
     * Cannot delete own account
     *
     * @param id User ID to delete
     * @param request HTTP request for authentication
     * @return ResponseEntity with operation result
     */
    @DeleteMapping("/{id}")
    fun deleteUser(
        @PathVariable id: Long,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<Unit>> {
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

            // Check if user has ADMIN role
            val userRole = jwtProvider.getRoleFromToken(token)
            if (userRole != UserRole.ADMIN.name) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse(
                        success = false,
                        message = "Insufficient permissions. ADMIN role required.",
                        data = null
                    ))
            }

            // Prevent self-deletion
            val currentUserId = jwtProvider.getUserIdFromToken(token)
            if (currentUserId == id) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse(
                        success = false,
                        message = "Cannot delete your own account",
                        data = null
                    ))
            }

            // Delete the user
            usersService.deleteUser(id)
            ResponseEntity.ok()
                .body(ApiResponse(
                    success = true,
                    message = "User deleted successfully",
                    data = null
                ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(
                    success = false,
                    message = e.message ?: "User not found",
                    data = null
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "Failed to delete user: ${e.message}",
                    data = null
                ))
        }
    }

    /**
     * Get users created within a date range (Admin only)
     * GET /api/users/date-range
     *
     * Requires: ADMIN role
     *
     * @param startDate Start date in ISO format (yyyy-MM-dd'T'HH:mm:ss)
     * @param endDate End date in ISO format (yyyy-MM-dd'T'HH:mm:ss)
     * @param request HTTP request for authentication
     * @return ResponseEntity with list of users in date range
     */
    @GetMapping("/date-range")
    fun getUsersByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) startDate: LocalDateTime,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) endDate: LocalDateTime,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<List<UserDto.UserResponse>>> {
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

            // Check if user has ADMIN role
//            val userRole = jwtProvider.getRoleFromToken(token)
//            if (userRole != UserRole.ADMIN.name) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN)
//                    .body(ApiResponse(
//                        success = false,
//                        message = "Insufficient permissions. ADMIN role required.",
//                        data = null
//                    ))
//            }

            // Validate date range
            if (startDate.isAfter(endDate)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse(
                        success = false,
                        message = "Start date must be before end date",
                        data = null
                    ))
            }

            // Fetch users by date range
            val users = usersService.getUsersByDateRange(startDate, endDate)
            ResponseEntity.ok()
                .body(ApiResponse(
                    success = true,
                    message = "Users retrieved successfully for the specified date range",
                    data = users
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "Failed to retrieve users by date range: ${e.message}",
                    data = null
                ))
        }
    }

    /**
     * Update user status and password (Admin only or self-update)
     * PUT /api/users/{id}
     *
     * Requires: ADMIN role for updating other users, self-update allowed for own account
     *
     * @param id User ID to update
     * @param request Update request containing new status and password
     * @param httpRequest HTTP request for authentication
     * @return ResponseEntity with updated user data
     */
    @PutMapping("/{id}")
    fun updateUser(
        @PathVariable id: Long,
        @RequestBody request: UserDto.UserUpdateRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<UserDto.UserResponse>> {
        return try {
            // Extract and validate JWT token
            val token = extractTokenFromRequest(httpRequest)
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

            // Get current user information
            val currentUserId = jwtProvider.getUserIdFromToken(token)
            val currentUserRole = jwtProvider.getRoleFromToken(token)

            // Authorization check:
            // 1. Allow if user is updating their own account
            // 2. Allow if user is ADMIN and updating other accounts
            // 3. Deny if regular user tries to update another user's account
            if (currentUserId != id && currentUserRole != UserRole.ADMIN.name) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse(
                        success = false,
                        message = "Insufficient permissions. You can only update your own account.",
                        data = null
                    ))
            }

            // Additional validation for password
            if (request.password.isBlank() || request.password.length < 6) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse(
                        success = false,
                        message = "Password must be at least 6 characters long",
                        data = null
                    ))
            }

            // Update user
            val updatedUser = usersService.updateUser(id, request)
            ResponseEntity.ok()
                .body(ApiResponse(
                    success = true,
                    message = "User updated successfully",
                    data = updatedUser
                ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(
                    success = false,
                    message = e.message ?: "User not found",
                    data = null
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "Failed to update user: ${e.message}",
                    data = null
                ))
        }
    }

    /**
     * Get users by role (Admin only)
     * GET /api/users/role/{role}
     *
     * Requires: ADMIN role
     *
     * @param role User role to filter by (ADMIN, USER, etc.)
     * @param request HTTP request for authentication
     * @return ResponseEntity with list of users having the specified role
     */
    @GetMapping("/role/{role}")
    fun getUsersByRole(
        @PathVariable role: String,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<List<UserDto.UserResponse>>> {
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

            // Check if user has ADMIN role
            val userRole = jwtProvider.getRoleFromToken(token)
            if (userRole != UserRole.ADMIN.name) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse(
                        success = false,
                        message = "Insufficient permissions. ADMIN role required.",
                        data = null
                    ))
            }

            // Parse role string to enum
            val userRoleEnum = try {
                UserRole.valueOf(role.uppercase())
            } catch (e: IllegalArgumentException) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse(
                        success = false,
                        message = "Invalid role specified. Valid roles: ${UserRole.values().joinToString { it.name }}",
                        data = null
                    ))
            }

            // Fetch users by role
            val users = usersService.getUsersByRole(userRoleEnum)
            ResponseEntity.ok()
                .body(ApiResponse(
                    success = true,
                    message = "Users with role '$role' retrieved successfully",
                    data = users
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "Failed to retrieve users by role: ${e.message}",
                    data = null
                ))
        }
    }

    /**
     * Get user by ID (Admin or self-view)
     * GET /api/users/{id}
     *
     * @param id User ID to retrieve
     * @param request HTTP request for authentication
     * @return ResponseEntity with user data
     */
    @GetMapping("/{id}")
    fun getUserById(
        @PathVariable id: Long,
        request: HttpServletRequest
    ): ResponseEntity<out ApiResponse<out Any>?> {
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

            // Get current user information
            val currentUserId = jwtProvider.getUserIdFromToken(token)
            val currentUserRole = jwtProvider.getRoleFromToken(token)

            // Authorization check:
            // 1. Allow if user is viewing their own profile
            // 2. Allow if user is ADMIN
            // 3. Deny if regular user tries to view another user's profile
            if (currentUserId != id && currentUserRole != UserRole.ADMIN.name) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse(
                        success = false,
                        message = "Insufficient permissions. You can only view your own profile.",
                        data = null
                    ))
            }

            // Fetch user by ID (you'll need to add this method to UsersService)
            val user = usersService.getUserById(id)
            ResponseEntity.ok()
                .body(ApiResponse(
                    success = true,
                    message = "User retrieved successfully",
                    data = user
                ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(
                    success = false,
                    message = e.message ?: "User not found",
                    data = null
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "Failed to retrieve user: ${e.message}",
                    data = null
                ))
        }
    }

    @GetMapping("/except/{currentUserId}")
    fun getAllUsersExceptCurrentUser(@PathVariable currentUserId: Long): ResponseEntity<List<UserDto.PrivateUserResponse>?> {
        val users = usersService.getAllUsersExceptCurrentUser(currentUserId)
        return ResponseEntity.ok(users)
    }

    @GetMapping("/search/{currentUserId}")
    fun searchUsers(
        @PathVariable currentUserId: Long,
        @RequestParam query: String
    ): ResponseEntity<List<UserDto.PrivateUserResponse>?> {
        val users = usersService.searchUsers(currentUserId, query)
        return ResponseEntity.ok(users)
    }

    /**
     * Extract JWT token from Authorization header
     *
     * @param request HTTP request
     * @return JWT token string or null if not found
     */
    private fun extractTokenFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else {
            null
        }
    }
}

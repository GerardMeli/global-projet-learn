package com.reli237.web_application_chat.controller

import com.reli237.web_application_chat.dto.UserDto
import com.reli237.web_application_chat.security.JwtProvider
import com.reli237.web_application_chat.service.UsersService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.servlet.http.HttpSession
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["*"], maxAge = 3600)
class AuthController(
    private val usersService: UsersService,
    private val jwtProvider: JwtProvider
) {

    companion object {
        private val logger = LoggerFactory.getLogger(AuthController::class.java)
    }

    /**
     * Register a new user
     * POST /api/auth/register
     *
     * @param request User registration request containing email and password
     * @return ResponseEntity with the created user data or error message
     */
    @PostMapping("/register")
    fun register(
        @RequestBody
        request: UserDto.UserCreateRequest
    ): ResponseEntity<ApiResponse<UserDto.UserResponse>> {
        return try {
            if (request.email.isBlank() || request.password.isBlank()) {
                ResponseEntity.badRequest()
                    .body(ApiResponse(
                        success = false,
                        message = "Email and password cannot be empty",
                        data = null
                    ))
            } else {
                val user = usersService.createUser(request)
                ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse(
                        success = true,
                        message = "User registered successfully",
                        data = user
                    ))
            }
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest()
                .body(ApiResponse(
                    success = false,
                    message = e.message ?: "Registration failed",
                    data = null
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "An error occurred during registration",
                    data = null
                ))
        }
    }

    /**
     * Login user and generate JWT token
     * POST /api/auth/login
     *
     * @param request User login request containing email and password
     * @return ResponseEntity with login response containing user data and JWT token
     */
    @PostMapping("/login")
    fun login(
        @RequestBody request: UserDto.UserLoginRequest,
        httpSession: HttpSession
    ): ResponseEntity<ApiResponse<LoginResponseDto>> {
        return try {
            // Validate input
            if (request.email.isBlank() || request.password.isBlank()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse(
                        success = false,
                        message = "Email and password are required",
                        data = null
                    ))
            }

            // Authenticate user credentials
            val user = usersService.authenticateUser(request)

            // Generate JWT token with user claims
            val token = jwtProvider.generateTokenWithClaims(
                userId = user.id,
                email = user.email,
                role = user.role.toString()
            )

            // Generate session ID (Spring automatically creates it)
            val sessionId = httpSession.id

            // Store user info in session
            httpSession.setAttribute("userId", user.id)
            httpSession.setAttribute("email", user.email)
            httpSession.setAttribute("role", user.role.toString())
            httpSession.setAttribute("loginTime", System.currentTimeMillis())

            // Set session timeout (30 minutes)
            httpSession.maxInactiveInterval = 30 * 60

            // Calculate token expiration
            val expiresIn = jwtProvider.getTokenExpirationSeconds()

            val loginResponse = LoginResponseDto(
                user = user,
                token = token,
                tokenType = "Bearer",
                expiresIn = expiresIn,
                sessionId = sessionId  // Include sessionId in response
            )

            ResponseEntity.ok()
                .header("X-Session-Id", sessionId)  // Also send as header
                .body(ApiResponse(
                    success = true,
                    message = "Login successful",
                    data = loginResponse
                ))

        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest()
                .body(ApiResponse(
                    success = false,
                    message = e.message ?: "Invalid credentials",
                    data = null
                ))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(
                    success = false,
                    message = e.message ?: "User account is inactive",
                    data = null
                ))
        } catch (e: Exception) {
            logger.error("Login error", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "An error occurred during login",
                    data = null
                ))
        }
    }

    /**
     * Check email availability for registration
     * GET /api/auth/check-email
     *
     * @param email Email address to check for availability
     * @return ResponseEntity with email availability status
     */
    @GetMapping("/check-email")
    fun checkEmailAvailability(
        @RequestParam email: String  // The email to check, passed as a query parameter
    ): ResponseEntity<ApiResponse<EmailAvailabilityDto>> {
        return try {
            // Trim any leading/trailing spaces from the email
            val trimmedEmail = email.trim()

            // Validate that the email is not blank
            if (trimmedEmail.isBlank()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse(
                        success = false,
                        message = "Email cannot be blank",
                        data = null
                    )
                )
            }

            // Check if the email already exists in the database
            val exists = usersService.emailExists(trimmedEmail)

            // Return the API response indicating availability
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = if (exists) "Email already registered" else "Email is available",
                    data = EmailAvailabilityDto(
                        email = trimmedEmail,
                        available = !exists
                    )
                )
            )

        } catch (e: Exception) {
            // Catch any unexpected exceptions and return 500
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Error checking email availability",
                    data = null
                )
            )
        }
    }

    /**
     * Get current authenticated user profile
     * GET /api/auth/me
     *
     * @param request HTTP request containing Authorization header with JWT token
     * @return ResponseEntity with current user profile data
     */
    @GetMapping("/me")
    fun getCurrentUser(request: HttpServletRequest): ResponseEntity<ApiResponse<UserDto.UserResponse>> {
        return try {
            // 1. Extract JWT token
            val token = extractTokenFromRequest(request)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse(
                        success = false,
                        message = "Authorization token is missing",
                        data = null
                    )
                )

            // 2. Validate token
            if (!jwtProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse(
                        success = false,
                        message = "Invalid or expired token",
                        data = null
                    )
                )
            }

            // 3. Extract claims using provided helper functions
            val userId = jwtProvider.getUserIdFromToken(token)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse(
                        success = false,
                        message = "Unable to extract user ID from token",
                        data = null
                    )
                )

            val email = jwtProvider.getEmailFromToken(token)
            val role = jwtProvider.getRoleFromToken(token)

            // 4. Fetch user from DB (authoritative source)
            val user = usersService.getUserById(userId)

            // 5. Build response
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "User profile retrieved successfully",
                    data = UserDto.UserResponse(
                        id = user.id,
                        email = user.email,   // fallback to DB if missing in token
                        role = user.role,
                        isActive = user.isActive,
                        createdAt = user.createdAt
                    )
                )
            )

        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse(
                    success = false,
                    message = "Failed to retrieve user profile",
                    data = null
                )
            )
        }
    }

    /**
     * Logout user (client-side token invalidation)
     * POST /api/auth/logout
     *
     * Note: Since JWT is stateless, actual token invalidation requires client-side handling
     * This endpoint provides a standardized logout flow for frontend applications
     *
     * @param response HTTP response to clear any authentication headers/cookies
     * @return ResponseEntity with logout confirmation
     */
    @PostMapping("/logout")
    fun logout(
        request: HttpServletRequest,
        response: HttpServletResponse
    ): ResponseEntity<ApiResponse<Unit>> {
        return try {
            // 1. Extract token
            val token = extractTokenFromRequest(request)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse(
                        success = false,
                        message = "Authorization token is missing",
                        data = null
                    )
                )

            // 2. Validate token
            if (!jwtProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse(
                        success = false,
                        message = "Invalid or expired token",
                        data = null
                    )
                )
            }

            // 3. Use token data (logout is stateless, but token is read)
            val userId = jwtProvider.getUserIdFromToken(token)
            val email = jwtProvider.getEmailFromToken(token)

            // Optional: audit/log logout
            println("User logged out: userId=$userId, email=$email")

            // 4. Clear response headers
            response.setHeader("Authorization", "")
            response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")

            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Logout successful. Please clear your token from client storage.",
                    data = null
                )
            )

        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Logout failed",
                    data = null
                )
            )
        }
    }

    /**
     * Refresh authentication token
     * POST /api/auth/refresh-token
     *
     * @param request HTTP request containing the current JWT token
     * @return ResponseEntity with new JWT token if current token is valid
     */
    @PostMapping("/refresh-token")
    fun refreshToken(request: HttpServletRequest): ResponseEntity<ApiResponse<TokenRefreshResponseDto>> {
        return try {
            // Extract token from request
            val currentToken = extractTokenFromRequest(request)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse(
                        success = false,
                        message = "Authorization token is required",
                        data = null
                    ))

            // Attempt to refresh the token using JwtProvider
            val newToken = jwtProvider.refreshToken(currentToken)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse(
                        success = false,
                        message = "Invalid or expired token. Please login again.",
                        data = null
                    ))

            // Calculate expiration time for the new token
            val expiresIn = jwtProvider.getTokenExpirationSeconds()

            ResponseEntity.ok()
                .body(ApiResponse(
                    success = true,
                    message = "Token refreshed successfully",
                    data = TokenRefreshResponseDto(
                        token = newToken,
                        tokenType = "Bearer",
                        expiresIn = expiresIn
                    )
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse(
                    success = false,
                    message = "Failed to refresh token: ${e.message}",
                    data = null
                ))
        }
    }

    /**
     * Validate JWT token
     * POST /api/auth/validate-token
     *
     * @param token JWT token to validate
     * @return ResponseEntity with token validation result
     */
    @PostMapping("/validate-token")
    fun validateToken(@RequestParam token: String): ResponseEntity<ApiResponse<TokenValidationResponseDto>> {
        return try {
            val isValid = jwtProvider.validateToken(token)
            val isExpired = jwtProvider.isTokenExpired(token)
            val timeRemaining = jwtProvider.getTokenExpirationTime(token)
            val userId = jwtProvider.getUserIdFromToken(token)

            ResponseEntity.ok()
                .body(ApiResponse(
                    success = true,
                    message = if (isValid) "Token is valid" else "Token is invalid",
                    data = TokenValidationResponseDto(
                        isValid = isValid,
                        isExpired = isExpired,
                        timeRemainingMs = timeRemaining,
                        userId = userId,
                        expiresIn = if (isValid) jwtProvider.getTokenExpirationSeconds() else 0
                    )
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(
                    success = false,
                    message = "Token validation failed: ${e.message}",
                    data = null
                ))
        }
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

    /**
     * Extract user ID from request using JWT token
     *
     * @param request HTTP request
     * @return User ID or null if token is invalid/missing
     */
    private fun extractUserIdFromRequest(request: HttpServletRequest): Long? {
        val token = extractTokenFromRequest(request)
        return token?.let { jwtProvider.getUserIdFromToken(it) }
    }

}

/**
 * Data Transfer Object for token validation response
 */
data class TokenValidationResponseDto(
    val isValid: Boolean,
    val isExpired: Boolean,
    val timeRemainingMs: Long,
    val userId: Long?,
    val expiresIn: Long
)
// Response DTOs
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?,
    val timestamp: Long = System.currentTimeMillis()
)

data class LoginResponseDto(
    val user: UserDto.UserResponse,
    val token: String,
    val tokenType: String,
    val expiresIn: Long,
    val sessionId: String
)

data class EmailAvailabilityDto(
    val email: String,
    val available: Boolean
)

data class TokenRefreshResponseDto(
    val token: String,
    val tokenType: String,
    val expiresIn: Long
)
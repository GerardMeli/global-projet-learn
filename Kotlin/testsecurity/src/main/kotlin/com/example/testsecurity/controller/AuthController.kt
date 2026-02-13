package com.example.testsecurity.controller

import com.example.testsecurity.dto.*
import com.example.testsecurity.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    // Login endpoint
    @PostMapping("/login")
    fun login(
        @Valid @RequestBody loginRequest: LoginRequest
    ): ResponseEntity<AuthResponse> {
        val token = authService.authenticateUser(loginRequest)
        return ResponseEntity.ok().build()
    }

    // Registration endpoint
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(
        @Valid @RequestBody registrationRequest: RegistrationRequest
    ): ResponseEntity<AuthResponse> {
        // Register new user
        authService.registerUser(registrationRequest)

        // Authenticate and return token
        val token = authService.authenticateUser(
            LoginRequest(
                email = registrationRequest.email,
                password = registrationRequest.password,
                role = registrationRequest.roles
            )
        )
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(AuthResponse(token.toString()))

    }

    // Refresh token endpoint
    @PostMapping("/refresh")
    fun refreshToken(
        @Valid @RequestBody refreshRequest: RefreshTokenRequest
    ): ResponseEntity<AuthResponse> {
        val token = authService.refreshAccessToken(refreshRequest.refreshToken)
        return ResponseEntity.ok(AuthResponse(token.toString()))
    }

    // Logout endpoint
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun logout(
        @RequestHeader("Authorization") token: String,
        @Valid @RequestBody logoutRequest: LogoutRequest
    ): ResponseEntity<Void> {
        authService.invalidateToken(logoutRequest.refreshToken)
        return ResponseEntity.noContent().build()
    }

    // Get current user profile
    @GetMapping("/me")
    fun getCurrentUser(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<UserProfileResponse> {
        val userProfile = authService.getUserProfile(userDetails.username)
        return ResponseEntity.ok(userProfile)
    }

    // Get all users (Admin only)
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    fun getAllUsers(): ResponseEntity<List<UserResponse>> {
        val users = authService.getAllUsers()
        return ResponseEntity.ok(users)
    }

    // Public endpoints
    @GetMapping("/public")
    fun publicEndpoint(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf("message" to "This is a public endpoint"))
    }

    @GetMapping("/protected")
    fun protectedEndpoint(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf("message" to "This is a protected endpoint"))
    }

    // Welcome endpoint
    @GetMapping("/welcome")
    fun welcome(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf("message" to "Welcome to reli237.com API"))
    }
}
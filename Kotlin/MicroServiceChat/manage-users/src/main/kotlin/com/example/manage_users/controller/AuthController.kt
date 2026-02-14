package com.example.manage_users.controller

import com.example.manage_users.dto.EmailPwdDto
import com.example.manage_users.dto.RegistrationDto
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.impl.AuthServiceImpl
import com.example.manage_users.service.impl.UserServiceImpl
import com.example.manage_users.service.interf.AuthService
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController (
    private val authService: AuthService,
    private val jwtProvider: JwtProvider,
    private val authServiceImpl: AuthServiceImpl
) {

       private val logger = LoggerFactory.getLogger(AuthController::class.java)

    @GetMapping("/")
    fun home(): String {
        return "Hello World"
    }

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegistrationDto.RegisterRequest): ResponseEntity<RegistrationDto.RegisterResponse> {
        val response = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PostMapping("/login")
    fun login(
        @RequestBody request: RegistrationDto.LoginRequest,
        httpSession: HttpSession
    ): ResponseEntity<ApiResponse<RegistrationDto.LoginResponse>> {
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
            val user = authServiceImpl.authenticateUser(request)

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

            val loginResponse = RegistrationDto.LoginResponse(
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

    @PostMapping("/refresh-token")
    fun refreshToken(@Valid @RequestBody request: RegistrationDto.RefreshTokenRequest): ResponseEntity<RegistrationDto.TokenResponse> {
        val response = authService.refreshToken(request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/verify-email")
    fun verifyEmail(@Valid @RequestBody request: EmailPwdDto.EmailVerificationRequest): ResponseEntity<Void> {
        authService.verifyEmail(request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/resend-verification")
    fun resendVerificationEmail(@Valid @RequestBody request: EmailPwdDto.ResendVerificationEmailRequest): ResponseEntity<Void> {
        authService.resendVerificationEmail(request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/forgot-password")
    fun forgotPassword(@Valid @RequestBody request: EmailPwdDto.ForgotPasswordRequest): ResponseEntity<Void> {
        authService.forgotPassword(request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/reset-password")
    fun resetPassword(@Valid @RequestBody request: EmailPwdDto.ResetPasswordRequest): ResponseEntity<Void> {
        authService.resetPassword(request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/logout")
    fun logout(@RequestParam userId: Long): ResponseEntity<Void> {
        authService.logout(userId)
        return ResponseEntity.ok().build()
    }
}
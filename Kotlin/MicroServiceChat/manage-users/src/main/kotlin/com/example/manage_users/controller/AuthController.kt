package com.example.manage_users.controller

import com.example.manage_users.dto.EmailPwdDto
import com.example.manage_users.dto.RegistrationDto
import com.example.manage_users.service.interf.AuthService
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController (
    private val authService: AuthService
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
    fun login(@Valid @RequestBody request: RegistrationDto.LoginRequest): ResponseEntity<RegistrationDto.LoginResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
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
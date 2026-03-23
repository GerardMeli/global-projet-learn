package com.reli237.web_application_chat.feign

import com.reli237.web_application_chat.dto.UserDto
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.http.ResponseEntity
//import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@FeignClient("MANAGE-USERS")
interface UsersWebChatInterface {

    @PostMapping("/api/auth/forgot-password")
    fun forgotPassword(@Valid @RequestBody request: UserDto.ForgotPasswordRequest): ResponseEntity<Void>

    @PostMapping("/api/auth/reset-password")
    fun resetPassword(@Valid @RequestBody request: UserDto.ResetPasswordRequest): ResponseEntity<Void>

    @PostMapping("/api/auth/logout")
    fun logout(@RequestParam userId: String): ResponseEntity<Void>

    // CORRECTION ICI - Supprimez HttpSession car Feign ne peut pas l'envoyer
    @PostMapping("/api/auth/login")
    fun login(@RequestBody request: UserDto.LoginRequest): ResponseEntity<UserDto.ApiResponse<UserDto.LoginResponse>>

    @GetMapping("/api/admin/users/{userId}")
    fun getUserById(@PathVariable userId: String): ResponseEntity<UserDto.UserProfileResponse>

    @GetMapping("/api/admin/users/{userId}/basic")  // Nouveau endpoint
    fun getUserBasicInfo(@PathVariable userId: String): ResponseEntity<UserDto.UserResponse>

}
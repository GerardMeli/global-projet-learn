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

    @GetMapping("/{userId}")
//    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun getUserProfile(@PathVariable userId: Long): ResponseEntity<UserDto.UserProfileResponse>

    @PostMapping("/forgot-password")
    fun forgotPassword(@Valid @RequestBody request: UserDto.ForgotPasswordRequest): ResponseEntity<Void>

    @PostMapping("/reset-password")
    fun resetPassword(@Valid @RequestBody request: UserDto.ResetPasswordRequest): ResponseEntity<Void>

    @PostMapping("/logout")
    fun logout(@RequestParam userId: Long): ResponseEntity<Void>

    // CORRECTION ICI - Supprimez HttpSession car Feign ne peut pas l'envoyer
    @PostMapping("/login")
    fun login(@RequestBody request: UserDto.LoginRequest): ResponseEntity<UserDto.ApiResponse<UserDto.LoginResponse>>

    @GetMapping("/{userId}")
    fun getUserById(@PathVariable userId: Long): ResponseEntity<UserDto.UserProfileResponse>

    @GetMapping("/{userId}/basic")  // Nouveau endpoint
    fun getUserBasicInfo(@PathVariable userId: Long): ResponseEntity<UserDto.UserResponse>

}
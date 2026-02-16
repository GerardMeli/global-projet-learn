package com.reli237.web_application_chat.feign

import com.reli237.web_application_chat.dto.UserDto
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.http.ResponseEntity
//import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@FeignClient("")
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

    @PostMapping("/login")
    fun login(
        @RequestBody request: UserDto.LoginRequest,
        httpSession: HttpSession
    ): ResponseEntity<UserDto.ApiResponse<UserDto.LoginResponse>>

    @GetMapping("/{userId}")
    fun getUserById(@PathVariable userId: Long): ResponseEntity<UserDto.UserProfileResponse>

    fun UserDto.UserProfileResponse.toUserResponse(): UserDto.UserResponse {
        return UserDto.UserResponse(
            id = this.id,
            email = this.email,
            role = this.role,
            isActive = this.isActive,
            createdAt = this.createdAt
        )
    }


}
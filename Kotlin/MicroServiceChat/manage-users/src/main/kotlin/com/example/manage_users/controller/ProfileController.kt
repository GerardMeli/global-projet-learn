package com.example.manage_users.controller

import com.example.manage_users.dto.ProfileDto
import com.example.manage_users.service.interf.UsersService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/profile")
class ProfileController (
    private val userService: UsersService
) {

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun getUserProfile(@PathVariable userId: Long): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.getUserProfile(userId)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun updateUserProfile(
        @PathVariable userId: Long,
        @Valid @RequestBody request: ProfileDto.UserProfileUpdateRequest
    ): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.updateUserProfile(userId, request)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/{userId}/preferences")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun updateUserPreferences(
        @PathVariable userId: Long,
        @Valid @RequestBody request: ProfileDto.UserPreferencesUpdateRequest
    ): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.updateUserPreferences(userId, request)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{userId}/password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun changePassword(
        @PathVariable userId: Long,
        @Valid @RequestBody request: ProfileDto.PasswordChangeRequest
    ): ResponseEntity<Void> {
        userService.changePassword(userId, request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/{userId}/email-change-request")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun requestEmailChange(
        @PathVariable userId: Long,
        @Valid @RequestBody request: ProfileDto.EmailUpdateRequest
    ): ResponseEntity<Void> {
        userService.requestEmailChange(userId, request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/{userId}/email-change-confirm")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    fun confirmEmailChange(
        @PathVariable userId: Long,
        @RequestParam token: String
    ): ResponseEntity<Void> {
        userService.confirmEmailChange(userId, token)
        return ResponseEntity.ok().build()
    }
}
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
    
    fun getUserProfile(@PathVariable userId: Long): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.getUserProfile(userId)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{userId}")
    
    fun updateUserProfile(
        @PathVariable userId: Long,
        @Valid @RequestBody request: ProfileDto.UserProfileUpdateRequest
    ): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.updateUserProfile(userId, request)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/{userId}/preferences")
    
    fun updateUserPreferences(
        @PathVariable userId: Long,
        @Valid @RequestBody request: ProfileDto.UserPreferencesUpdateRequest
    ): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.updateUserPreferences(userId, request)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{userId}/password")
    
    fun changePassword(
        @PathVariable userId: Long,
        @Valid @RequestBody request: ProfileDto.PasswordChangeRequest
    ): ResponseEntity<Void> {
        userService.changePassword(userId, request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/{userId}/email-change-request")
    
    fun requestEmailChange(
        @PathVariable userId: Long,
        @Valid @RequestBody request: ProfileDto.EmailUpdateRequest
    ): ResponseEntity<Void> {
        userService.requestEmailChange(userId, request)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/email-change-confirm")
    fun confirmEmailChange(@RequestParam token: String): ResponseEntity<Map<String, Any>> {
        userService.confirmEmailChange(token)

        val response = mapOf(
            "succès" to true,
            "message" to "Votre email a été confirmé avec succès ! ✅",
            "horodatage" to System.currentTimeMillis()
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/except/{currentUserId}")
    fun getAllUsersExceptCurrentUser(@PathVariable currentUserId: Long): ResponseEntity<List<ProfileDto.PrivateUserResponse>?> {
        val users = userService.getAllUsersExceptCurrentUser(currentUserId)
        return ResponseEntity.ok(users)
    }

}
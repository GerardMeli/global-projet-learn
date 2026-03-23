package com.example.manage_users.controller

import com.example.manage_users.dto.ProfileDto
import com.example.manage_users.service.interf.UsersService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profil Utilisateur", description = "Endpoints pour la gestion du profil personnel et des préférences")
class ProfileController (
    private val userService: UsersService
) {

    @Operation(summary = "Obtenir le profil", description = "Récupère les informations complètes du profil d'un utilisateur.")
    @GetMapping("/{userId}")
    fun getUserProfile(@PathVariable userId: String): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.getUserProfile(userId)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "Mettre à jour le profil", description = "Modifie les informations personnelles de l'utilisateur.")
    @PutMapping("/{userId}")
    fun updateUserProfile(
        @PathVariable userId: String,
        @Valid @RequestBody request: ProfileDto.UserProfileUpdateRequest
    ): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.updateUserProfile(userId, request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "Mettre à jour les préférences", description = "Modifie les réglages et préférences de l'utilisateur.")
    @PatchMapping("/{userId}/preferences")
    fun updateUserPreferences(
        @PathVariable userId: String,
        @Valid @RequestBody request: ProfileDto.UserPreferencesUpdateRequest
    ): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.updateUserPreferences(userId, request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "Changer le mot de passe", description = "Permet à l'utilisateur de définir un nouveau mot de passe.")
    @PutMapping("/{userId}/password")
    fun changePassword(
        @PathVariable userId: String,
        @Valid @RequestBody request: ProfileDto.PasswordChangeRequest
    ): ResponseEntity<Void> {
        userService.changePassword(userId, request)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "Demander un changement d'email", description = "Initie une procédure de modification d'adresse email.")
    @PostMapping("/{userId}/email-change-request")
    fun requestEmailChange(
        @PathVariable userId: String,
        @Valid @RequestBody request: ProfileDto.EmailUpdateRequest
    ): ResponseEntity<Void> {
        userService.requestEmailChange(userId, request)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "Confirmer le changement d'email", description = "Valide le changement d'adresse email via un token.")
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

    @Operation(summary = "Lister les autres utilisateurs", description = "Récupère tous les utilisateurs sauf l'utilisateur spécifié.")
    @GetMapping("/except/{currentUserId}")
    fun getAllUsersExceptCurrentUser(@PathVariable currentUserId: String): ResponseEntity<List<ProfileDto.PrivateUserResponse>?> {
        val users = userService.getAllUsersExceptCurrentUser(currentUserId)
        return ResponseEntity.ok(users)
    }

}

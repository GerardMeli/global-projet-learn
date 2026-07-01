package com.example.manage_users.controller

import com.example.manage_users.dto.AdminDto
import com.example.manage_users.dto.ProfileDto
import com.example.manage_users.dto.RegistrationDto
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.UsersService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Administration", description = "Endpoints pour la gestion administrative des utilisateurs")
class AdminController (
    private val userService: UsersService,
    private val jwtProvider: JwtProvider
) {

    @Operation(summary = "Récupérer tous les utilisateurs", description = "Retourne la liste complète des utilisateurs inscrits.")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/")
    fun getAllUsers(request: HttpServletRequest): ResponseEntity<ApiResponse<List<ProfileDto.UserProfileResponse>>> {
        return try {
            // Extract and validate JWT token
            val token = extractTokenFromRequest(request)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse(
                        success = false,
                        message = "Authorization token is required",
                        data = null
                    ))

            if (!jwtProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse(
                        success = false,
                        message = "Invalid or expired token",
                        data = null
                    ))
            }

            // Fetch all users
            val users = userService.getAllUsers()
            ResponseEntity.ok()
                .body(ApiResponse(
                    success = true,
                    message = "Users retrieved successfully",
                    data = users
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "Failed to retrieve users: ${e.message}",
                    data = null
                ))
        }
    }

    // ── Créer un utilisateur (admin only) ─────────────────────────────────────
    @Operation(summary = "Créer un utilisateur", description = "Permet à un administrateur de créer un nouvel utilisateur manuellement.")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/")
    fun createUser(
        @Valid @RequestBody request: AdminDto.CreateUserRequest
    ): ResponseEntity<ApiResponse<AdminDto.CreateUserResponse>> {
        return try {
            val created = userService.createUser(request)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse(
                    success = true,
                    message = "Utilisateur créé avec succès",
                    data = created
                ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse(
                    success = false,
                    message = e.message ?: "Email déjà utilisé",
                    data = null
                ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "Erreur lors de la création : ${e.message}",
                    data = null
                ))
        }
    }

    @Operation(summary = "Récupérer un utilisateur par ID", description = "Récupère les détails d'un utilisateur spécifique par son identifiant unique.")
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    fun getUserById(@PathVariable userId: String): ResponseEntity<ProfileDto.UserProfileResponse> {
        val response = userService.getUserById(userId)
        return ResponseEntity.ok(response)
    }

    // Dans le controller du microservice manage-users
    @Operation(summary = "Récupérer les infos de base", description = "Récupère les informations essentielles d'un utilisateur.")
    @GetMapping("/{userId}/basic")
    fun getUserBasicInfo(@PathVariable userId: String): ResponseEntity<RegistrationDto.UserResponse> {
        val profile = userService.getUserById(userId)
        val basicInfo = RegistrationDto.UserResponse(
            id = profile.id,
            email = profile.email,
            role = profile.role,
            isActive = profile.isActive,
            createdAt = profile.createdAt
        )
        return ResponseEntity.ok(basicInfo)
    }

    @Operation(summary = "Mettre à jour un utilisateur", description = "Modifie les informations d'un utilisateur existant par un administrateur.")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{userId}")
    fun updateUser(
        @PathVariable userId: String,
        @Valid @RequestBody request: AdminDto.AdminUserUpdateRequest
    ): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.updateUser(userId, request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "Mettre à jour le statut", description = "Active ou désactive un compte utilisateur.")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PatchMapping("/{userId}/status")
    fun updateUserStatus(
        @PathVariable userId: String,
        @Valid @RequestBody request: AdminDto.UserStatusUpdateRequest
    ): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.updateUserStatus(userId, request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "Mettre à jour le rôle", description = "Modifie le rôle d'un utilisateur (ex: USER vers ADMIN).")
    @PatchMapping("/{userId}/role")
    fun updateUserRole(
        @PathVariable userId: String,
        @Valid @RequestBody request: AdminDto.UserRoleUpdateRequest
    ): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.updateUserRole(userId, request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "Supprimer un utilisateur", description = "Supprime définitivement un utilisateur du système.")
    @DeleteMapping("/{userId}")
    fun deleteUser(@PathVariable userId: String): ResponseEntity<Void> {
        userService.deleteUser(userId)
        return ResponseEntity.noContent().build()
    }

    private fun extractTokenFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else {
            null
        }
    }

}

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?,
    val timestamp: Long = System.currentTimeMillis()
)

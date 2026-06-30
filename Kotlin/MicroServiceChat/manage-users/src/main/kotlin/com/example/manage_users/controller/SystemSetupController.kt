package com.example.manage_users.controller

import com.example.manage_users.dto.RegistrationDto
import com.example.manage_users.service.interf.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth/system")
@CrossOrigin(origins = ["*"], maxAge = 3600)
@Tag(name = "System Setup", description = "Endpoints pour l'initialisation du système")
class SystemSetupController(
    private val authService: AuthService
) {

    @Operation(summary = "Vérifier si le système est initialisé", description = "Vérifie si un Super Admin existe déjà.")
    @GetMapping("/initialized")
    fun isSystemInitialized(): ResponseEntity<Map<String, Boolean>> {
        val initialized = authService.isSystemInitialized()
        return ResponseEntity.ok(mapOf("initialized" to initialized))
    }

    @Operation(summary = "Initialisation du système", description = "Crée le premier utilisateur Super Admin (une seule fois).")
    @PostMapping("/setup")
    fun setupSystem(@Valid @RequestBody request: RegistrationDto.RegisterRequest): ResponseEntity<RegistrationDto.RegisterResponse> {
        val response = authService.setupSystem(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }
}

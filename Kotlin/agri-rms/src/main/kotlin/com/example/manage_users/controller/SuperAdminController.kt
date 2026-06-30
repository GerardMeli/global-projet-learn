package com.example.manage_users.controller

import com.example.manage_users.dto.SuperAdminDto
import com.example.manage_users.service.interf.SuperAdminService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

// ─────────────────────────────────────────────────────────────────────────────
//  SuperAdminController
//  Base URL : /api/super-admins
//  Accès    : SUPER_ADMIN uniquement (renforcé par SecurityConfig + @PreAuthorize)
// ─────────────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/super-admins")
@PreAuthorize("hasRole('SUPER_ADMIN')")
class SuperAdminController (
    private val superAdminService: SuperAdminService
) {

    // ── POST /api/super-admins ─────────────────────────────────────────────
    @PostMapping
    fun create(
        @Valid @RequestBody dto: SuperAdminDto.SuperAdminCreateDto
    ): ResponseEntity<SuperAdminDto.SuperAdminResponseDto> {
        val created = superAdminService.create(dto)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    // ── GET /api/super-admins ──────────────────────────────────────────────
    @GetMapping
    fun findAll(): ResponseEntity<List<SuperAdminDto.SuperAdminResponseDto>> =
        ResponseEntity.ok(superAdminService.findAll())

    // ── GET /api/super-admins/{id} ─────────────────────────────────────────
    @GetMapping("/{id}")
    fun findById(@PathVariable id: String): ResponseEntity<SuperAdminDto.SuperAdminResponseDto> =
        ResponseEntity.ok(superAdminService.findById(id))

    // ── GET /api/super-admins/search?q=... ────────────────────────────────
    @GetMapping("/search")
    fun search(
        @RequestParam q: String
    ): ResponseEntity<List<SuperAdminDto.SuperAdminResponseDto>> =
        ResponseEntity.ok(superAdminService.search(q))

    // ── PUT /api/super-admins/{id} ─────────────────────────────────────────
    @PutMapping("/{id}")
    fun update(
        @PathVariable id: String,
        @Valid @RequestBody dto: SuperAdminDto.SuperAdminUpdateDto
    ): ResponseEntity<SuperAdminDto.SuperAdminResponseDto> =
        ResponseEntity.ok(superAdminService.update(id, dto))

    // ── DELETE /api/super-admins/{id} ──────────────────────────────────────
//    @DeleteMapping("/{id}")
//    fun delete(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
//        superAdminService.delete(id)
//        return ResponseEntity.ok(mapOf("message" to "SUPER_ADMIN supprimé avec succès."))
//    }
}
package com.example.manage_users.controller

import com.example.manage_users.dto.DGeneraleDto
import com.example.manage_users.service.interf.DGeneraleService
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
//  DGeneraleController
//  Base URL : /api/d-generales
//
//  CREATE / DELETE → SUPER_ADMIN uniquement
//  READ / UPDATE   → SUPER_ADMIN + D_GENERALE (délégation)
//
//  La vérification des champs sensibles lors du UPDATE est faite dans le service.
// ─────────────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/d-generales")
class DGeneraleController(
    private val dGeneraleService: DGeneraleService
) {

    // ── POST /api/d-generales ──────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun create(
        @Valid @RequestBody dto: DGeneraleDto.DGeneraleCreateDto
    ): ResponseEntity<DGeneraleDto.DGeneraleResponseDto> {
        val created = dGeneraleService.create(dto)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    // ── GET /api/d-generales ───────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findAll(): ResponseEntity<List<DGeneraleDto.DGeneraleResponseDto>> =
        ResponseEntity.ok(dGeneraleService.findAll())

    // ── GET /api/d-generales/{id} ──────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findById(@PathVariable id: String): ResponseEntity<DGeneraleDto.DGeneraleResponseDto> =
        ResponseEntity.ok(dGeneraleService.findById(id))

    // ── GET /api/d-generales/search?q=... ─────────────────────────────────
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun search(
        @RequestParam q: String
    ): ResponseEntity<List<DGeneraleDto.DGeneraleResponseDto>> =
        ResponseEntity.ok(dGeneraleService.search(q))

    // ── PUT /api/d-generales/{id} ──────────────────────────────────────────
    // Le service vérifie en interne si le D_GENERALE tente de modifier des
    // champs réservés (status, isActive, permission) et lève un BusinessAccessDeniedException.
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun update(
        @PathVariable id: String,
        @Valid @RequestBody dto: DGeneraleDto.DGeneraleUpdateDto
    ): ResponseEntity<DGeneraleDto.DGeneraleResponseDto> =
        ResponseEntity.ok(dGeneraleService.update(id, dto))

    // ── DELETE /api/d-generales/{id} ───────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun delete(@PathVariable id: String): ResponseEntity<Map<String, String>> {
        dGeneraleService.delete(id)
        return ResponseEntity.ok(mapOf("message" to "D_GENERALE supprimé avec succès."))
    }
}

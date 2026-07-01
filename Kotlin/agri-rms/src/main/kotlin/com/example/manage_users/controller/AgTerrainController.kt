package com.example.manage_users.controller

import com.example.manage_users.dto.AgTerrainDto
import com.example.manage_users.service.interf.AgTerrainService
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
//  AgTerrainController
//  Base URL : /api/ag-terrains
// ─────────────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/ag-terrains")
class AgTerrainController (
    private val agTerrainService: AgTerrainService
) {

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun create(
        @Valid @RequestBody dto: AgTerrainDto.AgTerrainCreateDto
    ): ResponseEntity<AgTerrainDto.AgTerrainResponseDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(agTerrainService.create(dto))

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findAll(): ResponseEntity<List<AgTerrainDto.AgTerrainResponseDto>> =
        ResponseEntity.ok(agTerrainService.findAll())

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findById(@PathVariable id: String): ResponseEntity<AgTerrainDto.AgTerrainResponseDto> =
        ResponseEntity.ok(agTerrainService.findById(id))

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun search(@RequestParam q: String): ResponseEntity<List<AgTerrainDto.AgTerrainResponseDto>> =
        ResponseEntity.ok(agTerrainService.search(q))

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun update(
        @PathVariable id: String,
        @Valid @RequestBody dto: AgTerrainDto.AgTerrainUpdateDto
    ): ResponseEntity<AgTerrainDto.AgTerrainResponseDto> =
        ResponseEntity.ok(agTerrainService.update(id, dto))

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun delete(@PathVariable id: String): ResponseEntity<Map<String, String>> {
        agTerrainService.delete(id)
        return ResponseEntity.ok(mapOf("message" to "AG_TERRAIN supprimé avec succès."))
    }
}

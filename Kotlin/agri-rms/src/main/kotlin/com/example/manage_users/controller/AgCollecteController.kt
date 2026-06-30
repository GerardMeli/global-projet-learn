package com.example.manage_users.controller

import com.example.manage_users.dto.AgCollectDto
import com.example.manage_users.service.interf.AgCollecteService
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
//  AgCollecteController
//  Base URL : /api/ag-collectes
// ─────────────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/ag-collectes")
class AgCollecteController(
    private val agCollecteService: AgCollecteService
) {

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun create(
        @Valid @RequestBody dto: AgCollectDto.AgCollecteCreateDto
    ): ResponseEntity<AgCollectDto.AgCollecteResponseDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(agCollecteService.create(dto))

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findAll(): ResponseEntity<List<AgCollectDto.AgCollecteResponseDto>> =
        ResponseEntity.ok(agCollecteService.findAll())

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findById(@PathVariable id: String): ResponseEntity<AgCollectDto.AgCollecteResponseDto> =
        ResponseEntity.ok(agCollecteService.findById(id))

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun search(@RequestParam q: String): ResponseEntity<List<AgCollectDto.AgCollecteResponseDto>> =
        ResponseEntity.ok(agCollecteService.search(q))

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun update(
        @PathVariable id: String,
        @Valid @RequestBody dto: AgCollectDto.AgCollecteUpdateDto
    ): ResponseEntity<AgCollectDto.AgCollecteResponseDto> =
        ResponseEntity.ok(agCollecteService.update(id, dto))

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun delete(@PathVariable id: String): ResponseEntity<Map<String, String>> {
        agCollecteService.delete(id)
        return ResponseEntity.ok(mapOf("message" to "AG_COLLECTE supprimé avec succès."))
    }
}

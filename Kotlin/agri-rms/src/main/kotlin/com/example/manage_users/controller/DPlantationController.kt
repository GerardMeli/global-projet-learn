package com.example.manage_users.controller

import com.example.manage_users.dto.DPlantationDto
import com.example.manage_users.service.interf.DPlantationService
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
//  DPlantationController
//  Base URL : /api/d-plantations
// ─────────────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/d-plantations")
class DPlantationController (
    private val dPlantationService: DPlantationService
) {

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun create(
        @Valid @RequestBody dto: DPlantationDto.DPlantationCreateDto
    ): ResponseEntity<DPlantationDto.DPlantationResponseDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(dPlantationService.create(dto))

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findAll(): ResponseEntity<List<DPlantationDto.DPlantationResponseDto>> =
        ResponseEntity.ok(dPlantationService.findAll())

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findById(@PathVariable id: String): ResponseEntity<DPlantationDto.DPlantationResponseDto> =
        ResponseEntity.ok(dPlantationService.findById(id))

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun search(@RequestParam q: String): ResponseEntity<List<DPlantationDto.DPlantationResponseDto>> =
        ResponseEntity.ok(dPlantationService.search(q))

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun update(
        @PathVariable id: String,
        @Valid @RequestBody dto: DPlantationDto.DPlantationUpdateDto
    ): ResponseEntity<DPlantationDto.DPlantationResponseDto> =
        ResponseEntity.ok(dPlantationService.update(id, dto))

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun delete(@PathVariable id: String): ResponseEntity<Map<String, String>> {
        dPlantationService.delete(id)
        return ResponseEntity.ok(mapOf("message" to "D_PLANTATION supprimé avec succès."))
    }
}
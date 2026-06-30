package com.example.manage_users.controller

import com.example.manage_users.dto.RespoStockDto
import com.example.manage_users.service.interf.RespoStockService
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
//  RespoStockController
//  Base URL : /api/respo-stocks
// ─────────────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/respo-stocks")
class RespoStockController (
    private val respoStockService: RespoStockService
) {

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun create(
        @Valid @RequestBody dto: RespoStockDto.RespoStockCreateDto
    ): ResponseEntity<RespoStockDto.RespoStockResponseDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(respoStockService.create(dto))

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findAll(): ResponseEntity<List<RespoStockDto.RespoStockResponseDto>> =
        ResponseEntity.ok(respoStockService.findAll())

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun findById(@PathVariable id: String): ResponseEntity<RespoStockDto.RespoStockResponseDto> =
        ResponseEntity.ok(respoStockService.findById(id))

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun search(@RequestParam q: String): ResponseEntity<List<RespoStockDto.RespoStockResponseDto>> =
        ResponseEntity.ok(respoStockService.search(q))

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'D_GENERALE')")
    fun update(
        @PathVariable id: String,
        @Valid @RequestBody dto: RespoStockDto.RespoStockUpdateDto
    ): ResponseEntity<RespoStockDto.RespoStockResponseDto> =
        ResponseEntity.ok(respoStockService.update(id, dto))

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun delete(@PathVariable id: String): ResponseEntity<Map<String, String>> {
        respoStockService.delete(id)
        return ResponseEntity.ok(mapOf("message" to "RESPO_STOCK supprimé avec succès."))
    }
}
package com.reli237.web_application_chat.feign

import org.springframework.cloud.openfeign.FeignClient
import org.springframework.core.io.Resource
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.multipart.MultipartFile

@FeignClient("SYSTEM-MANAGER-FILE")
interface WebChatInterface {

    // -------- Upload file --------
    @PostMapping(
        value = ["/api/files/upload"],
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE]
    )
    fun uploadFile(
        @RequestPart("file") file: MultipartFile,
        @RequestPart("description") description: String
    ): ResponseEntity<Map<String, Any>>

    // -------- Download file by filename --------
    @GetMapping("/api/files/download/{fileName}")
    fun downloadFile(
        @PathVariable fileName: String
    ): ResponseEntity<Resource>

    // -------- Update description --------
    @PutMapping("/api/files/{id}/description")
    fun updateFileDescription(
        @PathVariable id: Long,
        @RequestParam description: String
    ): ResponseEntity<Map<String, Any>>

    // -------- Get all files --------
    @GetMapping("/api/files")
    fun getAllFiles(): ResponseEntity<Map<String, Any>>

    // -------- Delete file --------
    @DeleteMapping("/api/files/{id}")
    fun deleteFileById(
        @PathVariable id: Long
    ): ResponseEntity<Map<String, Any>>

    // -------- Search files --------
    @GetMapping("/api/files/search")
    fun searchFiles(
        @RequestParam fileName: String
    ): ResponseEntity<Map<String, Any>>

}
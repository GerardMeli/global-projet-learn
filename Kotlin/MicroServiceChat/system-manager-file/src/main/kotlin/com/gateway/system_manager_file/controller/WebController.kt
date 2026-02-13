package com.gateway.system_manager_file.controller

import com.gateway.system_manager_file.service.FileService
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.core.io.Resource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
//@Controller
@RequestMapping("/api/files")
class WebController(
    private var fileService: FileService
) {

    companion object {
        private val log = LoggerFactory.getLogger(WebController::class.java)
    }

    /**
     * Upload a file with description
     * POST /api/files/upload
     */
    @PostMapping("/upload", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("description") description: String
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val fileEntity = fileService.storeFile(file, description)
            log.info("File uploaded successfully: ${fileEntity.fileName}")

            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "File uploaded successfully!",
                    "data" to fileEntity
                )
            )
        } catch (ex: Exception) {
            log.error("File upload failed!", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                mapOf(
                    "success" to false,
                    "message" to "File upload failed: ${ex.message}",
                    "error" to ex.javaClass.simpleName
                )
            )
        }
    }

    /**
     * Get all files
     * GET /api/files
     */
    @GetMapping
    fun getAllFiles(): ResponseEntity<Map<String, Any>> {
        return try {
            val files = fileService.getAllFile()
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Files retrieved successfully",
                    "data" to files,
                    "count" to files.size
                )
            )
        } catch (ex: Exception) {
            log.error("Failed to retrieve files", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                mapOf(
                    "success" to false,
                    "message" to "Failed to retrieve files: ${ex.message}",
                    "error" to ex.javaClass.simpleName
                )
            )
        }
    }

    /**
     * Get file by ID
     * GET /api/files/{id}
     */
    @GetMapping("/{id}")
    fun getFileById(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        return try {
            val file = fileService.getFileById(id)
            if (file != null) {
                ResponseEntity.ok(
                    mapOf(
                        "success" to true,
                        "message" to "File found",
                        "data" to file
                    )
                )
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    mapOf(
                        "success" to false,
                        "message" to "File not found with id: $id"
                    )
                )
            }
        } catch (ex: Exception) {
            log.error("Failed to retrieve file with id: $id", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                mapOf(
                    "success" to false,
                    "message" to "Failed to retrieve file: ${ex.message}",
                    "error" to ex.javaClass.simpleName
                )
            )
        }
    }

    /**
     * Download file by filename
     * GET /api/files/download/{fileName}
     */
    @GetMapping("/download/{fileName:.+}")
    fun downloadFile(
        @PathVariable fileName: String,
        request: HttpServletRequest
    ): ResponseEntity<Resource> {
        return try {
            val resource = fileService.loadFileAsRessource(fileName)
            var contentType = request.servletContext.getMimeType(resource.file.absolutePath)

            if (contentType == null) {
                contentType = "application/octet-stream"
            }

            log.info("File downloaded: $fileName")

            ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"${resource.filename}\""
                )
                .body(resource)
        } catch (ex: Exception) {
            log.error("File download failed for: $fileName", ex)
            throw ex
        }
    }

    /**
     * Download file by ID
     * GET /api/files/download-by-id/{id}
     */
    @GetMapping("/download-by-id/{id}")
    fun downloadFileById(
        @PathVariable id: Long,
        request: HttpServletRequest
    ): ResponseEntity<Resource> {
        return try {
            val fileEntity = fileService.getFileById(id)

            if (fileEntity == null) {
                return ResponseEntity.notFound().build()
            }

            val resource = fileService.loadFileAsRessource(fileEntity.fileName)
            var contentType = request.servletContext.getMimeType(resource.file.absolutePath)

            if (contentType == null) {
                contentType = fileEntity.fileType.takeIf { it != "unknown" } ?: "application/octet-stream"
            }

            log.info("File downloaded by ID: $id - ${fileEntity.fileName}")

            ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"${fileEntity.originalFileName}\""
                )
                .body(resource)
        } catch (ex: Exception) {
            log.error("File download by ID failed: $id", ex)
            throw ex
        }
    }

    /**
     * Delete file by ID
     * DELETE /api/files/{id}
     */
    @DeleteMapping("/{id}")
    fun deleteFileById(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        return try {
            val fileEntity = fileService.getFileById(id)

            if (fileEntity == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    mapOf(
                        "success" to false,
                        "message" to "File not found with id: $id"
                    )
                )
            }

            fileService.deleteFileById(id)
            log.info("File deleted: ${fileEntity.fileName}")

            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "File deleted successfully",
                    "deletedFile" to fileEntity
                )
            )
        } catch (ex: Exception) {
            log.error("File deletion failed for id: $id", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                mapOf(
                    "success" to false,
                    "message" to "Failed to delete file: ${ex.message}",
                    "error" to ex.javaClass.simpleName
                )
            )
        }
    }

    /**
     * Search files by filename
     * GET /api/files/search?fileName=xxx
     */
    @GetMapping("/search")
    fun searchFiles(@RequestParam fileName: String): ResponseEntity<Map<String, Any>> {
        return try {
            val files = fileService.search(fileName)
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Search completed",
                    "query" to fileName,
                    "data" to files,
                    "count" to files.size
                )
            )
        } catch (ex: Exception) {
            log.error("File search failed for: $fileName", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                mapOf(
                    "success" to false,
                    "message" to "Search failed: ${ex.message}",
                    "error" to ex.javaClass.simpleName
                )
            )
        }
    }

    /**
     * Update file description
     * PUT /api/files/{id}/description
     */
    @PutMapping("/{id}/description")
    fun updateFileDescription(
        @PathVariable id: Long,
        @RequestParam description: String
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val updatedFile = fileService.updateFileDescription(id, description)

            if (updatedFile == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    mapOf(
                        "success" to false,
                        "message" to "File not found with id: $id"
                    )
                )
            }

            log.info("File description updated for: ${updatedFile.fileName}")

            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "File description updated successfully",
                    "data" to updatedFile
                )
            )
        } catch (ex: Exception) {
            log.error("Failed to update file description for id: $id", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                mapOf(
                    "success" to false,
                    "message" to "Failed to update description: ${ex.message}",
                    "error" to ex.javaClass.simpleName
                )
            )
        }
    }

    /**
     * Get file statistics
     * GET /api/files/stats
     */
    @GetMapping("/stats")
    fun getFileStats(): ResponseEntity<Map<String, Any>> {
        return try {
            val files = fileService.getAllFile()
            val totalSize = files.sumOf { it.fileSize.toLongOrNull() ?: 0L }
            val fileTypeCount = files.groupBy { it.fileType }.mapValues { it.value.size }

            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Statistics retrieved successfully",
                    "data" to mapOf(
                        "totalFiles" to files.size,
                        "totalSizeBytes" to totalSize,
                        "totalSizeMB" to String.format("%.2f", totalSize / (1024.0 * 1024.0)),
                        "fileTypeDistribution" to fileTypeCount
                    )
                )
            )
        } catch (ex: Exception) {
            log.error("Failed to retrieve file statistics", ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                mapOf(
                    "success" to false,
                    "message" to "Failed to retrieve statistics: ${ex.message}",
                    "error" to ex.javaClass.simpleName
                )
            )
        }
    }
}
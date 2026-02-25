package com.gateway.system_manager_file.service

import com.gateway.system_manager_file.config.FileStorageProperties
import com.gateway.system_manager_file.entity.FileEntity
import com.gateway.system_manager_file.exception.FileNotFoundException
import com.gateway.system_manager_file.exception.FileStorageException
import com.gateway.system_manager_file.repository.FileRepository
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.net.MalformedURLException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.UUID

@Service
class FileServiceImpl(
    private val fileRepository: FileRepository,
    private val fileStorageProperties: FileStorageProperties
) : FileService {

    companion object {
        private val log = LoggerFactory.getLogger(FileServiceImpl::class.java)
    }

    private val fileStorageLocation: Path =
        Paths.get(fileStorageProperties.uploadDir).toAbsolutePath().normalize()

    init {
        try {
            Files.createDirectories(fileStorageLocation)
            log.info("File storage directory created/verified at: $fileStorageLocation")
        } catch (e: Exception) {
            log.error("Could not create upload directory", e)
            throw FileStorageException("Could not create upload directory", e)
        }
    }

    /**
     * Store a file with description
     */
    override fun storeFile(
        file: MultipartFile,
        description: String
    ): FileEntity {
        if (file.isEmpty) {
            throw FileStorageException("Failed to store empty file ${file.originalFilename}")
        }

        val originalFileName = file.originalFilename ?: "unknown"
        val fileName = UUID.randomUUID().toString() + "_" + originalFileName

        try {
            // Security check: prevent path traversal attacks
            if (fileName.contains("..")) {
                throw FileStorageException("Cannot store file with relative path outside current directory: $fileName")
            }

            val targetLocation = this.fileStorageLocation.resolve(fileName)
            Files.copy(file.inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING)

            val fileEntity = FileEntity(
                fileName = fileName,
                originalFileName = originalFileName,
                fileType = file.contentType ?: "unknown",
                fileSize = file.size.toString(),
                filePath = targetLocation.toString(),
                description = description
            )

            val savedFile = fileRepository.save(fileEntity)
            log.info("File stored successfully: $fileName (Original: $originalFileName)")

            return savedFile
        } catch (ex: IOException) {
            log.error("Failed to store file: $fileName", ex)
            throw FileStorageException("Failed to store file $fileName", ex)
        }
    }

    /**
     * Load file as Resource for download
     */
    override fun loadFileAsRessource(fileName: String): Resource {
        try {
            val filePath = this.fileStorageLocation.resolve(fileName).normalize()
            val resource = UrlResource(filePath.toUri())

            if (resource.exists()) {
                log.info("File resource loaded: $fileName")
                return resource
            } else {
                log.warn("File not found: $fileName")
                throw FileNotFoundException("File not found: $fileName")
            }
        } catch (ex: MalformedURLException) {
            log.error("Malformed URL for file: $fileName", ex)
            throw FileStorageException("File not found: $fileName", ex)
        }
    }

    /**
     * Get all files from database
     */
    override fun getAllFile(): List<FileEntity> {
        val files = fileRepository.findAll()
        log.info("Retrieved ${files.size} files from database")
        return files
    }

    /**
     * Get file by ID
     */
    override fun getFileById(id: Long): FileEntity? {
        val file = fileRepository.findById(id).orElse(null)

        if (file != null) {
            log.info("File found with ID: $id - ${file.fileName}")
        } else {
            log.warn("File not found with ID: $id")
        }

        return file
    }

    /**
     * Delete file by ID (both from database and filesystem)
     */
    override fun deleteFileById(id: Long) {
        val fileEntity = fileRepository.findById(id)

        if (fileEntity.isPresent) {
            val file = fileEntity.get()

            try {
                // Delete from filesystem
                val filePath = this.fileStorageLocation.resolve(file.fileName).normalize()
                Files.deleteIfExists(filePath)
                log.info("Physical file deleted: ${file.fileName}")

                // Delete from database
                fileRepository.delete(file)
                log.info("File record deleted from database: ID $id - ${file.fileName}")

            } catch (ex: IOException) {
                log.error("Failed to delete physical file: ${file.fileName}", ex)
                // Still delete from database even if physical file deletion fails
                fileRepository.delete(file)
                log.warn("Database record deleted but physical file may still exist: ${file.fileName}")
            }
        } else {
            log.warn("Attempted to delete non-existent file with ID: $id")
        }
    }

    /**
     * Search files by filename (case-insensitive)
     */
    override fun search(fileName: String): List<FileEntity> {
        val results = fileRepository.findByFileNameIgnoreCase(fileName)
        log.info("Search for '$fileName' returned ${results.size} results")
        return results
    }

    /**
     * Update file description
     */
    override fun updateFileDescription(id: Long, description: String): FileEntity? {
        val fileEntity = fileRepository.findById(id).orElse(null)

        return if (fileEntity != null) {
            fileEntity.description = description
            val updatedFile = fileRepository.save(fileEntity)
            log.info("Updated description for file ID: $id - ${fileEntity.fileName}")
            updatedFile
        } else {
            log.warn("Cannot update description - file not found with ID: $id")
            null
        }
    }

    /**
     * Check if file exists by filename
     */
    override fun fileExists(fileName: String): Boolean {
        val filePath = this.fileStorageLocation.resolve(fileName).normalize()
        val exists = Files.exists(filePath)
        log.debug("File existence check for '$fileName': $exists")
        return exists
    }

    /**
     * Get file size in bytes
     */
    override fun getFileSize(fileName: String): Long {
        return try {
            val filePath = this.fileStorageLocation.resolve(fileName).normalize()
            val size = Files.size(filePath)
            log.debug("File size for '$fileName': $size bytes")
            size
        } catch (ex: IOException) {
            log.error("Failed to get file size for: $fileName", ex)
            0L
        }
    }

    /**
     * Get total storage used
     */
    override fun getTotalStorageUsed(): Long {
        return try {
            val allFiles = fileRepository.findAll()
            val totalSize = allFiles.sumOf { it.fileSize.toLongOrNull() ?: 0L }
            log.info("Total storage used: $totalSize bytes (${totalSize / (1024.0 * 1024.0)} MB)")
            totalSize
        } catch (ex: Exception) {
            log.error("Failed to calculate total storage", ex)
            0L
        }
    }

    /**
     * Get files by type
     */
    override fun getFilesByType(fileType: String): List<FileEntity> {
        val files = fileRepository.findAll().filter {
            it.fileType.equals(fileType, ignoreCase = true)
        }
        log.info("Found ${files.size} files of type: $fileType")
        return files
    }

    /**
     * Clean up orphaned files (files in storage but not in database)
     */
    override fun cleanupOrphanedFiles(): Int {
        return try {
            val dbFileNames = fileRepository.findAll().map { it.fileName }.toSet()
            var deletedCount = 0

            Files.list(fileStorageLocation).use { paths ->
                paths.forEach { path ->
                    val fileName = path.fileName.toString()
                    if (!dbFileNames.contains(fileName)) {
                        try {
                            Files.delete(path)
                            deletedCount++
                            log.info("Deleted orphaned file: $fileName")
                        } catch (ex: IOException) {
                            log.error("Failed to delete orphaned file: $fileName", ex)
                        }
                    }
                }
            }

            log.info("Cleanup completed: $deletedCount orphaned files deleted")
            deletedCount
        } catch (ex: Exception) {
            log.error("Failed to cleanup orphaned files", ex)
            0
        }
    }
}
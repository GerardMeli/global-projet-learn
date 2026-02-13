package com.gateway.system_manager_file.service

import com.gateway.system_manager_file.entity.FileEntity
import org.springframework.web.multipart.MultipartFile
import org.springframework.core.io.Resource

interface FileService {

    /**
     * Store a file with description
     */
    fun storeFile(file: MultipartFile, description: String): FileEntity

    /**
     * Load file as Resource for download
     */
    fun loadFileAsRessource(fileName: String): Resource

    /**
     * Get all files from database
     */
    fun getAllFile(): List<FileEntity>

    /**
     * Get file by ID
     */
    fun getFileById(id: Long): FileEntity?

    /**
     * Delete file by ID (both from database and filesystem)
     */
    fun deleteFileById(id: Long)

    /**
     * Search files by filename (case-insensitive)
     */
    fun search(fileName: String): List<FileEntity>

    /**
     * Update file description
     */
    fun updateFileDescription(id: Long, description: String): FileEntity?

    /**
     * Check if file exists by filename
     */
    fun fileExists(fileName: String): Boolean

    /**
     * Get file size in bytes
     */
    fun getFileSize(fileName: String): Long

    /**
     * Get total storage used
     */
    fun getTotalStorageUsed(): Long

    /**
     * Get files by type
     */
    fun getFilesByType(fileType: String): List<FileEntity>

    /**
     * Clean up orphaned files (files in storage but not in database)
     */
    fun cleanupOrphanedFiles(): Int
}
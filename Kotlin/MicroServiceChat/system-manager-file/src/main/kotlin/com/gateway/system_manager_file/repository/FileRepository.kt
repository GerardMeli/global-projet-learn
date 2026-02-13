package com.gateway.system_manager_file.repository

import com.gateway.system_manager_file.entity.FileEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface FileRepository: JpaRepository<FileEntity, Long> {

    fun findByFileNameIgnoreCase (fileName: String): List<FileEntity>
    fun findByFileType(fileType: String): List<FileEntity>
    fun findByFileName(fileName: String): Optional<FileEntity>

}
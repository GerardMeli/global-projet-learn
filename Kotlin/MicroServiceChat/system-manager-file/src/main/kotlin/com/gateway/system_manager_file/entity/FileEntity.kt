package com.gateway.system_manager_file.entity

import com.example.manage_users.utils.FilesIdGenerator
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
//@Data
@Table(name = "file")
data class FileEntity(

    @Id
    @Column(name = "id", length = 40, nullable = false, updatable = false)
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: String = "",

    @Column(nullable = false)
    var fileName: String = "",

    @Column(nullable = false)
    var originalFileName: String = "",

    @Column(nullable = false)
    var fileType: String = "",

    @Column(nullable = false)
    var fileSize: String = "",

    @Column(nullable = false)
    var filePath: String = "",

    @CreationTimestamp
    var uploadTime: LocalDateTime = LocalDateTime.now(),

    var description: String = ""

) {
    @PrePersist
    fun generateId() {
        if (id.isBlank())
            id = FilesIdGenerator.generate(fileType)
    }
}

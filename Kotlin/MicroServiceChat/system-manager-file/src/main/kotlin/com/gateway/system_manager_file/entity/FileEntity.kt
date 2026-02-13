package com.gateway.system_manager_file.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
//@Data
@Table(name = "file")
data class FileEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

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

)

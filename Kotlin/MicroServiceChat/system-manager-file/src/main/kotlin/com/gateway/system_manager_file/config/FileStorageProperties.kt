package com.gateway.system_manager_file.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "file")
data class FileStorageProperties(
    val uploadDir: String
)
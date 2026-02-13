package com.example.testsecurity.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "refresh_tokens")
data class RefreshToken(
    @Id
    val token: String,

    @Column(nullable = false)
    val username: String,

    @Column(nullable = false)
    val expiryDate: Instant,

    @Column(nullable = false)
    val createdAt: Instant = Instant.now()
)
package com.example.manage_users.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(
    name = "user_external_refs",
    indexes = [Index(name = "idx_external_id", columnList = "external_id")]
)
data class UserExternalRef(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    // ID du user dans la table users du Chat
    @Column(name = "chat_user_id", nullable = false)
    val chatUserId: Long,

    // userCode Agriculture ex: "RESP_1750425644567"
    @Column(name = "external_id", nullable = false, unique = true)
    val externalId: String,

    // Toujours "AGRICULTURE" pour ce cas
    @Column(name = "source", nullable = false, length = 50)
    val source: String = "AGRICULTURE",

    @Column(name = "migrated_at", nullable = false)
    val migratedAt: LocalDateTime = LocalDateTime.now()

)

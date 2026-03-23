package com.example.manage_users.models

import com.example.manage_users.utils.UsersIdGenerator
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.PrePersist
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(
    name = "user_external_refs",
    indexes = [Index(name = "idx_external_id", columnList = "external_id")]
)
data class UserExternalRef(

    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "varchar(37)", updatable = false, nullable = false)
    var id: String = "0",

    // ID du user dans la table users du Chat
    @Column(name = "chat_user_id", nullable = false)
    val chatUserId: String,

    // userCode Agriculture ex: "RESP_1750425644567"
    @Column(name = "external_id", nullable = false, unique = true)
    val externalId: String,

    // Toujours "AGRICULTURE" pour ce cas
    @Column(name = "source", nullable = false, length = 50)
    val source: String = "AGRICULTURE",

    @Column(name = "migrated_at", nullable = false)
    val migratedAt: LocalDateTime = LocalDateTime.now()

){
    @PrePersist
    fun assignId() {
        if (id.isBlank())
            id = UsersIdGenerator.forAgri()
    }
}

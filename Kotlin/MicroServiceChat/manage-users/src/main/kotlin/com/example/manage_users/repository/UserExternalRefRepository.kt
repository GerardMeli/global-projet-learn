package com.example.manage_users.repository

import com.example.manage_users.models.UserExternalRef
import org.springframework.data.jpa.repository.JpaRepository

interface UserExternalRefRepository  : JpaRepository<UserExternalRef, Long> {

    fun existsByExternalId(externalId: String): Boolean

    fun findByExternalId(externalId: String): UserExternalRef?
}
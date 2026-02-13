package com.example.testsecurity.repository

import com.example.testsecurity.model.RefreshToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
interface RefreshTokenRepository : JpaRepository<RefreshToken, String> {
    fun findByToken(token: String): RefreshToken?
    fun deleteByToken(token: String)
    fun deleteAllByUsername(username: String)

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.token = :newToken, rt.expiryDate = :expiryDate WHERE rt.token = :oldToken AND rt.username = :username")
    fun updateToken(oldToken: String, newToken: String, username: String, expiryDate: Instant = Instant.now().plusSeconds(7 * 24 * 60 * 60))
}
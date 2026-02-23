package com.reli237.web_application_chat.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtProvider(
    @Value("\${app.jwt.secret}")
    private val jwtSecret: String
) {
    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray())

    fun validateToken(token: String): Boolean {
        return try {
            val claims = getAllClaims(token)
            !claims.expiration.before(Date())
        } catch (e: Exception) { false }
    }

    fun getUserIdFromToken(token: String): Long {
        val claims = getAllClaims(token)
        val v = claims.get("userId")
        return when (v) {
            is Long -> v
            is Int -> v.toLong()
            else -> v.toString().toLong()
        }
    }

    fun getEmailFromToken(token: String): String? {
        val claims = getAllClaims(token)
        return claims.get("email", String::class.java) ?: claims.subject
    }

    fun getRoleFromToken(token: String): String? =
        getAllClaims(token).get("role", String::class.java)

    private fun getAllClaims(token: String): Claims =
        Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .body
}
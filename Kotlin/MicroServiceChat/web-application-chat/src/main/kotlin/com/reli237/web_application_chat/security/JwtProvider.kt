package com.reli237.web_application_chat.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtProvider(
    @Value("\${jwt.secret}")
    private val jwtSecret: String,

    @Value("\${jwt.expiration}")
    private val jwtExpirationInMs: Long
) {

    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray())

    /**
     * Generate JWT token from user ID
     */
//    fun generateToken(userId: Long): String {
//        return generateTokenFromUsername(userId.toString())
//    }

    /**
     * Generate JWT token from username/email
     */
    fun generateTokenFromUsername(username: String): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpirationInMs)

        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .claim("username", username)
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    /**
     * Generate JWT token with custom claims
     */
    fun generateTokenWithClaims(
        userId: Long,
        email: String,
        role: String
    ): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpirationInMs * 1000)

        return Jwts.builder()
            .setSubject(email)  // Subject should be email
            .claim("userId", userId)
            .claim("email", email)  // Explicitly set email claim
            .claim("role", role)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    /**
     * Get user ID from JWT token
     */
    fun getUserIdFromToken(token: String): Long {
        val claims = Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .body

        // Handle both Integer and Long types
        val userIdValue = claims.get("userId")
        return when (userIdValue) {
            is Long -> userIdValue
            is Integer -> userIdValue.toLong()
            is Int -> userIdValue.toLong()
            else -> userIdValue.toString().toLong()
        }
    }

    /**
     * Get username from JWT token
     */
    fun getUsernameFromToken(token: String?): String? {
        return try {
            val claims = getAllClaimsFromToken(token)
            claims.subject
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Get email from JWT token
     */
    fun getEmailFromToken(token: String): String? {
        val claims = Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .body

        return claims.get("email", String::class.java) ?: claims.subject
    }

    /**
     * Get role from JWT token
     */
    fun getRoleFromToken(token: String): String {
        val claims = Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .body

        return claims.get("role", String::class.java)
    }

    /**
     * Validate JWT token
     */
    fun validateToken(token: String?): Boolean {
        return try {
            Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Check if token is expired
     */
    fun isTokenExpired(token: String): Boolean {
        return try {
            val claims = getAllClaimsFromToken(token)
            claims.expiration.before(Date())
        } catch (e: Exception) {
            true
        }
    }

    /**
     * Get expiration date from token
     */
    fun getExpirationDateFromToken(token: String): Date? {
        return try {
            val claims = getAllClaimsFromToken(token)
            claims.expiration
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Get time remaining until token expiration (in milliseconds)
     */
    fun getTokenExpirationTime(token: String): Long {
        return try {
            val expirationDate = getExpirationDateFromToken(token) ?: return 0
            expirationDate.time - System.currentTimeMillis()
        } catch (e: Exception) {
            0
        }
    }

    /**
     * Refresh JWT token
     */
    fun refreshToken(token: String): String? {
        return try {
            if (validateToken(token)) {
                val claims = getAllClaimsFromToken(token)
                val userId = claims.subject
                generateTokenFromUsername(userId)
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Get all claims from token
     */
    private fun getAllClaimsFromToken(token: String?): Claims {
        return Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .body
    }

    /**
     * Get token expiration in seconds
     */
    fun getTokenExpirationSeconds(): Long {
        return jwtExpirationInMs / 1000
    }
}
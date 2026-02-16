package com.example.manage_users.security

import com.example.manage_users.execption.ExpiredTokenException
import com.example.manage_users.execption.InvalidTokenException
import com.example.manage_users.models.Users
import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.security.Key
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtProvider (
    @Value("\${app.jwt.secret}")
    private val jwtSecret: String,

    @Value("\${app.jwt.access-expiration}")
    private val accessTokenExpiration: Long,

    @Value("\${app.jwt.refresh-expiration}")
    private val refreshTokenExpiration: Long,

    @Value("\${app.jwt.email-change-expiration:3600000}") // 1 hour default
    private val emailChangeExpiration: Long,

    @Value("\${app.jwt.email-verification-expiration:86400000}") // 24 hours default
    private val emailVerificationExpiration: Long,

    @Value("\${app.jwt.password-reset-expiration:3600000}") // 1 hour default
    private val passwordResetExpiration: Long
) {

    companion object {
        private val log = LoggerFactory.getLogger(JwtProvider::class.java)
    }

    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray())

    fun generateAccessToken(email: String): String {
        return generateToken(email, accessTokenExpiration, "access")
    }

    fun generateRefreshToken(email: String): String {
        return generateToken(email, refreshTokenExpiration, "refresh")
    }

    private fun generateToken(email: String, expiration: Long, tokenType: String): String {
        val now = Date()
        val expiryDate = Date(now.time + expiration)

        return Jwts.builder()
            .setSubject(email)
            .claim("email", email)
            .claim("tokenType", tokenType)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    fun generateTokenWithClaims(
        userId: Long,
        email: String,
        role: String
    ): String {
        val now = Date()
        val expiryDate = Date(now.time + accessTokenExpiration)

        return Jwts.builder()
            .setSubject(email)
            .claim("userId", userId)
            .claim("email", email)
            .claim("role", role)
            .claim("tokenType", "access")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    fun generateOAuth2Token(userId: Long, email: String, role: String): String {
        return generateTokenWithClaims(userId, email, role)
    }

    /**
     * Create an email verification token
     */
    fun createEmailVerificationToken(userId: Long): String {
        val now = Date()
        val expiryDate = Date(now.time + emailVerificationExpiration)

        return Jwts.builder()
            .setSubject(userId.toString())
            .claim("userId", userId)
            .claim("tokenType", "email_verification")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    /**
     * Create a password reset token
     */
    /** Dans JwtProvider.kt **/
    fun createPasswordResetToken(userId: Long, email: String): String { // Ajoutez l'email en paramètre
        val now = Date()
        val expiryDate = Date(now.time + passwordResetExpiration)

        return Jwts.builder()
            .setSubject(email) // Utiliser l'email comme sujet est plus sûr pour votre filtre
            .claim("userId", userId)
            .claim("email", email)
            .claim("tokenType", "password_reset") // Ce champ DOIT être présent
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    fun getTokenTypeFromToken(token: String): String? {
        return try {
            val claims = getAllClaimsFromToken(token)
            claims.get("tokenType", String::class.java)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Create an email change token
     */
    fun createEmailChangeToken(userId: Long, newEmail: String): String {
        val now = Date()
        val expiryDate = Date(now.time + emailChangeExpiration)

        return Jwts.builder()
            .setSubject(userId.toString())
            .claim("userId", userId)
            .claim("newEmail", newEmail)
            .claim("tokenType", "email_change")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    /**
     * Validate email verification token and return userId
     */
    fun validateEmailVerificationToken(token: String): Long {
        try {
            val claims = getAllClaimsFromToken(token)

            // Check token type
            val tokenType = claims.get("tokenType", String::class.java)
            if (tokenType != "email_verification") {
                throw InvalidTokenException("Invalid token type")
            }

            // Check expiration
            if (claims.expiration.before(Date())) {
                throw ExpiredTokenException("Email verification token has expired")
            }

            // Get and return userId
            val userIdValue = claims.get("userId")
            return when (userIdValue) {
                is Long -> userIdValue
                is Int -> userIdValue.toLong()
                else -> userIdValue.toString().toLong()
            }
        } catch (e: ExpiredJwtException) {
            log.error("Email verification token expired: ${e.message}")
            throw ExpiredTokenException("Email verification token has expired")
        } catch (e: UnsupportedJwtException) {
            log.error("Unsupported JWT token: ${e.message}")
            throw InvalidTokenException("Invalid token format")
        } catch (e: MalformedJwtException) {
            log.error("Malformed JWT token: ${e.message}")
            throw InvalidTokenException("Invalid token format")
        } catch (e: SignatureException) {
            log.error("Invalid JWT signature: ${e.message}")
            throw InvalidTokenException("Invalid token signature")
        } catch (e: IllegalArgumentException) {
            log.error("JWT claims string is empty: ${e.message}")
            throw InvalidTokenException("Token is empty")
        } catch (e: Exception) {
            log.error("Error validating email verification token: ${e.message}")
            throw InvalidTokenException("Invalid token")
        }
    }

    /**
     * Validate password reset token and return userId
     */
    fun validatePasswordResetToken(token: String): Long {
        try {
            val claims = getAllClaimsFromToken(token)

            // Check token type
            val tokenType = claims.get("tokenType", String::class.java)
            if (tokenType != "password_reset") {
                throw InvalidTokenException("Invalid token type")
            }

            // Check expiration
            if (claims.expiration.before(Date())) {
                throw ExpiredTokenException("Password reset token has expired")
            }

            // Get and return userId
            val userIdValue = claims.get("userId")
            return when (userIdValue) {
                is Long -> userIdValue
                is Int -> userIdValue.toLong()
                else -> userIdValue.toString().toLong()
            }
        } catch (e: ExpiredJwtException) {
            log.error("Password reset token expired: ${e.message}")
            throw ExpiredTokenException("Password reset token has expired")
        } catch (e: UnsupportedJwtException) {
            log.error("Unsupported JWT token: ${e.message}")
            throw InvalidTokenException("Invalid token format")
        } catch (e: MalformedJwtException) {
            log.error("Malformed JWT token: ${e.message}")
            throw InvalidTokenException("Invalid token format")
        } catch (e: SignatureException) {
            log.error("Invalid JWT signature: ${e.message}")
            throw InvalidTokenException("Invalid token signature")
        } catch (e: IllegalArgumentException) {
            log.error("JWT claims string is empty: ${e.message}")
            throw InvalidTokenException("Token is empty")
        } catch (e: Exception) {
            log.error("Error validating password reset token: ${e.message}")
            throw InvalidTokenException("Invalid token")
        }
    }

    /**
     * Validate email change token and return userId
     */
    fun validateEmailChangeToken(token: String): Long {
        try {
            val claims = getAllClaimsFromToken(token)

            // Check token type
            val tokenType = claims.get("tokenType", String::class.java)
            if (tokenType != "email_change") {
                throw InvalidTokenException("Invalid token type")
            }

            // Check expiration
            if (claims.expiration.before(Date())) {
                throw ExpiredTokenException("Email change token has expired")
            }

            // Get and return userId
            val userIdValue = claims.get("userId")
            return when (userIdValue) {
                is Long -> userIdValue
                is Int -> userIdValue.toLong()
                else -> userIdValue.toString().toLong()
            }
        } catch (e: ExpiredJwtException) {
            log.error("Email change token expired: ${e.message}")
            throw ExpiredTokenException("Email change token has expired")
        } catch (e: UnsupportedJwtException) {
            log.error("Unsupported JWT token: ${e.message}")
            throw InvalidTokenException("Invalid token format")
        } catch (e: MalformedJwtException) {
            log.error("Malformed JWT token: ${e.message}")
            throw InvalidTokenException("Invalid token format")
        } catch (e: SignatureException) {
            log.error("Invalid JWT signature: ${e.message}")
            throw InvalidTokenException("Invalid token signature")
        } catch (e: IllegalArgumentException) {
            log.error("JWT claims string is empty: ${e.message}")
            throw InvalidTokenException("Token is empty")
        } catch (e: Exception) {
            log.error("Error validating email change token: ${e.message}")
            throw InvalidTokenException("Invalid token")
        }
    }

    /**
     * Get new email from email change token
     */
    fun getNewEmailFromToken(token: String): String {
        try {
            val claims = getAllClaimsFromToken(token)

            // Check token type
            val tokenType = claims.get("tokenType", String::class.java)
            if (tokenType != "email_change") {
                throw InvalidTokenException("Invalid token type")
            }

            // Get and return new email
            return claims.get("newEmail", String::class.java)
                ?: throw InvalidTokenException("New email not found in token")
        } catch (e: Exception) {
            log.error("Error getting new email from token: ${e.message}")
            throw InvalidTokenException("Invalid token")
        }
    }

    fun getUserIdFromToken(token: String): Long {
        val claims = getAllClaimsFromToken(token)
        val userIdValue = claims.get("userId")
        return when (userIdValue) {
            is Long -> userIdValue
            is Int -> userIdValue.toLong()
            else -> userIdValue.toString().toLong()
        }
    }

    fun getEmailFromToken(token: String): String? {
        val claims = getAllClaimsFromToken(token)
        return claims.get("email", String::class.java) ?: claims.subject
    }

    fun getRoleFromToken(token: String): String? {
        val claims = getAllClaimsFromToken(token)
        return claims.get("role", String::class.java)
    }

    fun validateToken(token: String): Boolean {
        return try {
            val claims = getAllClaimsFromToken(token)
            !claims.expiration.before(Date())
        } catch (e: Exception) {
            false
        }
    }

    fun getUsernameFromToken(token: String): String? {
        return try {
            getAllClaimsFromToken(token).subject
        } catch (e: Exception) {
            null
        }
    }

    fun getAccessTokenExpiration(): Long {
        return accessTokenExpiration
    }

    fun getRefreshTokenExpiration(): Long {
        return refreshTokenExpiration
    }

    fun getTokenExpirationSeconds(): Long {
        return accessTokenExpiration / 1000
    }

    private fun getAllClaimsFromToken(token: String): Claims {
        return Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .body
    }
}

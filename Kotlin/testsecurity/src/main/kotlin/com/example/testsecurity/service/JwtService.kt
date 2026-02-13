package com.example.testsecurity.service

import com.example.testsecurity.execption.InvalidTokenException
import com.example.testsecurity.execption.TokenGenerationException
import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.time.Duration
import java.time.Instant
import java.util.*
import javax.crypto.SecretKey

@Service
class JwtService {

    companion object {
        const val ACCESS_TOKEN_TYPE = "ACCESS"
        const val REFRESH_TOKEN_TYPE = "REFRESH"
        const val RESET_TOKEN_TYPE = "RESET"
        const val VERIFICATION_TOKEN_TYPE = "VERIFICATION"

//        private val logger = KotlinLogging.logger {}
    }
    private val logger = LoggerFactory.getLogger(this::class.java)


    @Value("\${jwt.secret}")  // Injected from application.yml
    private lateinit var secretKey: String

    @Value("\${jwt.access-token-expiration}")
    val accessTokenExpiration: Long = 15 * 60 * 1000  // 15 minutes default

    @Value("\${jwt.refresh-token-expiration}")
    val refreshTokenExpiration: Long = 7 * 24 * 60 * 60 * 1000  // 7 days default

    @Value("\${jwt.reset-token-expiration}")
    private val resetTokenExpiration: Long = 30 * 60 * 1000  // 30 minutes default

    @Value("\${jwt.verification-token-expiration}")
    private val verificationTokenExpiration: Long = 24 * 60 * 60 * 1000  // 24 hours default

    @Value("\${jwt.issuer}")
    private val issuer: String = "auth-service"

    // Generate access token for a user
    fun generateAccessToken(username: String): String {
        return generateToken(
            username = username,
            expirationMs = accessTokenExpiration,
            tokenType = ACCESS_TOKEN_TYPE
        )
    }

    // Generate refresh token for a user
    fun generateRefreshToken(username: String): String {
        return generateToken(
            username = username,
            expirationMs = refreshTokenExpiration,
            tokenType = REFRESH_TOKEN_TYPE
        )
    }

    // Generate password reset token
    fun generatePasswordResetToken(email: String): String {
        return generateToken(
            username = email,
            expirationMs = resetTokenExpiration,
            tokenType = RESET_TOKEN_TYPE
        )
    }

    // Generate email verification token
    fun generateEmailVerificationToken(email: String): String {
        return generateToken(
            username = email,
            expirationMs = verificationTokenExpiration,
            tokenType = VERIFICATION_TOKEN_TYPE
        )
    }

    // Generic token generation method
    private fun generateToken(
        username: String,
        expirationMs: Long,
        tokenType: String,
        additionalClaims: Map<String, Any> = emptyMap()
    ): String {
        val now = Instant.now()
        val expiryDate = now.plusMillis(expirationMs)

        try {
            return Jwts.builder()
                .setSubject(username)
                .setIssuer(issuer)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiryDate))
                .claim("token_type", tokenType)
                .addClaims(additionalClaims)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact()
        } catch (e: Exception) {
            logger.error("Failed to generate JWT token for user: $username", e)
            throw TokenGenerationException("Failed to generate token", e)
        }
    }

    // Extract username from JWT token
    fun extractUsername(token: String): String? {
        return try {
            extractAllClaims(token).subject
        } catch (e: Exception) {
            logger.warn("Failed to extract username from token", e)
            null
        }
    }

    // Extract token type from JWT token
    fun extractTokenType(token: String): String? {
        return try {
            extractAllClaims(token).get("token_type", String::class.java)
        } catch (e: Exception) {
            logger.warn("Failed to extract token type", e)
            null
        }
    }

    // Extract expiration from token
    fun extractExpiration(token: String): Instant? {
        return try {
            extractAllClaims(token).expiration?.toInstant()
        } catch (e: Exception) {
            logger.warn("Failed to extract expiration from token", e)
            null
        }
    }

    // Extract all claims from token
    fun extractAllClaims(token: String): Claims {
        return try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .body
        } catch (expiredJwtException: ExpiredJwtException) {
            logger.warn("Token expired: ${expiredJwtException.message}")
            throw expiredJwtException
        } catch (malformedJwtException: MalformedJwtException) {
            logger.warn("Invalid token format: ${malformedJwtException.message}")
            throw malformedJwtException
        } catch (securityException: SecurityException) {
            logger.warn("Invalid token signature: ${securityException.message}")
            throw securityException
        } catch (e: Exception) {
            logger.error("Error parsing token", e)
            throw InvalidTokenException("Invalid token", e)
        }
    }

    // Validate token (generic)
    fun validateToken(token: String): Boolean {
        return try {
            val claims = extractAllClaims(token)
            val expiration = claims.expiration.toInstant()
            val now = Instant.now()

            // Check expiration
            if (expiration.isBefore(now)) {
                logger.warn("Token expired at: $expiration")
                return false
            }

            // Validate issuer
            if (claims.issuer != issuer) {
                logger.warn("Invalid issuer: ${claims.issuer}")
                return false
            }

            true
        } catch (e: Exception) {
            logger.warn("Token validation failed", e)
            false
        }
    }

    // Validate token with specific type
    fun validateToken(token: String, expectedType: String): Boolean {
        if (!validateToken(token)) {
            return false
        }

        val tokenType = extractTokenType(token)
        return tokenType == expectedType
    }

    // Validate access token
    fun validateAccessToken(token: String): Boolean {
        return validateToken(token, ACCESS_TOKEN_TYPE)
    }

    // Validate refresh token
    fun validateRefreshToken(token: String): Boolean {
        return validateToken(token, REFRESH_TOKEN_TYPE)
    }

    // Validate password reset token
    fun validatePasswordResetToken(token: String): Boolean {
        return validateToken(token, RESET_TOKEN_TYPE)
    }

    // Check if token will expire soon (for proactive refresh)
    fun isTokenExpiringSoon(token: String, thresholdMinutes: Long = 5): Boolean {
        return try {
            val expiration = extractExpiration(token) ?: return true
            val now = Instant.now()
            val threshold = Duration.ofMinutes(thresholdMinutes)

            expiration.isBefore(now.plus(threshold))
        } catch (e: Exception) {
            logger.warn("Failed to check token expiration", e)
            true
        }
    }

    // Extract user details from token
    fun extractUserDetails(token: String): UserDetails? {
        return try {
            val username = extractUsername(token) ?: return null
            val claims = extractAllClaims(token)

            val authorities = extractAuthorities(claims)

            object : UserDetails {
                override fun getAuthorities(): Collection<GrantedAuthority> = authorities
                override fun getPassword(): String = ""
                override fun getUsername(): String = username
                override fun isAccountNonExpired(): Boolean = true
                override fun isAccountNonLocked(): Boolean = true
                override fun isCredentialsNonExpired(): Boolean = true
                override fun isEnabled(): Boolean = true
            }
        } catch (e: Exception) {
            logger.warn("Failed to extract user details from token", e)
            null
        }
    }

    // Extract authorities from claims
    private fun extractAuthorities(claims: Claims): List<GrantedAuthority> {
        return try {
            val roles = claims.get("roles", List::class.java)
            roles?.map { role ->
                SimpleGrantedAuthority(role.toString())
            } ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    // Generate signing key
    private fun getSigningKey(): SecretKey {
        return try {
            if (secretKey.length < 32) {
                throw IllegalArgumentException("JWT secret key must be at least 32 characters long")
            }
            Keys.hmacShaKeyFor(secretKey.toByteArray(Charsets.UTF_8))
        } catch (e: Exception) {
            logger.error("Failed to create signing key", e)
            throw SecurityException("Failed to create signing key", e)
        }
    }

    // Generate secure random secret key (for development/initial setup)
    fun generateSecureSecretKey(): String {
        val secureRandom = SecureRandom()
        val keyBytes = ByteArray(64)  // 512 bits
        secureRandom.nextBytes(keyBytes)
        return Base64.getEncoder().encodeToString(keyBytes)
    }
}
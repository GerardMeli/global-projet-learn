package com.example.manage_users.security

import com.example.manage_users.execption.ExpiredTokenException
import com.example.manage_users.execption.InvalidTokenException
import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
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
    private val passwordResetExpiration: Long,

    @Value("\${app.jwt.account-setup-expiration:86400000}") // 24 hours default
    private val accountSetupExpiration: Long
) {

    companion object {
        private val log = LoggerFactory.getLogger(JwtProvider::class.java)
    }

    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray())

    // ─────────────────────────────────────────────────────────────────────────
    //  Helper robuste : extrait userId depuis les claims sans crash sur Integer.
    //
    //  Problème : anciens tokens stockaient userId comme Integer (ex: 19).
    //  JJWT ne convertit pas Integer → String via claims.get("userId", String::class.java)
    //  et lève : "Cannot convert existing claim value of type Integer to String"
    //
    //  Solution : lire la valeur brute (Any?) et appeler .toString().
    //  Integer(19)    → "19"
    //  String("USERS-AG_TERRAIN_4A11DFD9") → "USERS-AG_TERRAIN_4A11DFD9"
    // ─────────────────────────────────────────────────────────────────────────
    private fun Claims.extractUserId(): String {
        val raw = this["userId"]
            ?: throw InvalidTokenException("userId introuvable dans le token.")
        return raw.toString()
    }

    // ── Génération ────────────────────────────────────────────────────────────

    fun generateAccessToken(email: String): String =
        generateToken(email, accessTokenExpiration, "access")

    fun generateRefreshToken(email: String): String =
        generateToken(email, refreshTokenExpiration, "refresh")

    fun getExpirationFromToken(token: String): Date =
        getAllClaimsFromToken(token).expiration

    private fun generateToken(email: String, expiration: Long, tokenType: String): String {
        val now = Date()
        return Jwts.builder()
            .setSubject(email)
            .claim("email", email)
            .claim("tokenType", tokenType)
            .setIssuedAt(now)
            .setExpiration(Date(now.time + expiration))
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    fun generateTokenWithClaims(userId: String, email: String, role: String): String {
        val now = Date()
        return Jwts.builder()
            .setSubject(email)
            .claim("userId", userId)
            .claim("email", email)
            .claim("role", role)
            .claim("tokenType", "access")
            .setIssuedAt(now)
            .setExpiration(Date(now.time + accessTokenExpiration))
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    fun generateOAuth2Token(userId: String, email: String, role: String): String =
        generateTokenWithClaims(userId, email, role)

    fun createEmailVerificationToken(userId: String): String {
        val now = Date()
        return Jwts.builder()
            .setSubject(userId)
            .claim("userId", userId)
            .claim("tokenType", "email_verification")
            .setIssuedAt(now)
            .setExpiration(Date(now.time + emailVerificationExpiration))
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    fun createPasswordResetToken(userId: String, email: String): String {
        val now = Date()
        return Jwts.builder()
            .setSubject(email)
            .claim("userId", userId)
            .claim("email", email)
            .claim("tokenType", "password_reset")
            .setIssuedAt(now)
            .setExpiration(Date(now.time + passwordResetExpiration))
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    fun createAccountSetupToken(userId: String, email: String): String {
        val now = Date()
        return Jwts.builder()
            .setSubject(email)
            .claim("userId", userId)
            .claim("email", email)
            .claim("tokenType", "account_setup")
            .setIssuedAt(now)
            .setExpiration(Date(now.time + accountSetupExpiration))
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    fun createEmailChangeToken(userId: String, newEmail: String): String {
        val now = Date()
        return Jwts.builder()
            .setSubject(userId)
            .claim("userId", userId)
            .claim("newEmail", newEmail)
            .claim("tokenType", "email_change")
            .setIssuedAt(now)
            .setExpiration(Date(now.time + emailChangeExpiration))
            .signWith(secretKey, SignatureAlgorithm.HS512)
            .compact()
    }

    // ── Validation — tous utilisent extractUserId() ────────────────────────────

    fun validateEmailVerificationToken(token: String): String {
        try {
            val claims = getAllClaimsFromToken(token)

            val tokenType = claims.get("tokenType", String::class.java)
            if (tokenType != "email_verification")
                throw InvalidTokenException("Invalid token type. Expected 'email_verification', got '$tokenType'")

            if (claims.expiration.before(Date()))
                throw ExpiredTokenException("Email verification token has expired")

            return claims.extractUserId()  // ← robuste Integer/String

        } catch (e: ExpiredJwtException)    { throw ExpiredTokenException("Email verification token has expired") }
        catch (e: ExpiredTokenException)    { throw e }
        catch (e: InvalidTokenException)    { throw e }
        catch (e: UnsupportedJwtException)  { throw InvalidTokenException("Invalid token format") }
        catch (e: MalformedJwtException)    { throw InvalidTokenException("Invalid token format") }
        catch (e: SignatureException)       { throw InvalidTokenException("Invalid token signature") }
        catch (e: IllegalArgumentException) { throw InvalidTokenException("Token is empty") }
        catch (e: Exception) {
            log.error("Error validating email verification token: ${e.message}")
            throw InvalidTokenException("Invalid token")
        }
    }

    fun validatePasswordResetToken(token: String): String {
        try {
            val claims = getAllClaimsFromToken(token)
            log.debug("Token claims: ${claims.entries.joinToString { "${it.key}=${it.value}" }}")

            val tokenType = claims.get("tokenType", String::class.java)
            if (tokenType != "password_reset")
                throw InvalidTokenException("Invalid token type. Expected 'password_reset', got '$tokenType'")

            if (claims.expiration.before(Date()))
                throw ExpiredTokenException("Password reset token has expired")

            return claims.extractUserId()  // ← robuste Integer/String

        } catch (e: ExpiredJwtException)    { throw ExpiredTokenException("Password reset token has expired") }
        catch (e: ExpiredTokenException)    { throw e }
        catch (e: InvalidTokenException)    { throw e }
        catch (e: UnsupportedJwtException)  { throw InvalidTokenException("Invalid token format") }
        catch (e: MalformedJwtException)    { throw InvalidTokenException("Invalid token format") }
        catch (e: SignatureException)       { throw InvalidTokenException("Invalid token signature") }
        catch (e: IllegalArgumentException) { throw InvalidTokenException("Token is empty") }
        catch (e: Exception) {
            log.error("Error validating password reset token: ${e.message}")
            throw InvalidTokenException("Invalid token")
        }
    }

    fun validateAccountSetupToken(token: String): String {
        try {
            val claims = getAllClaimsFromToken(token)

            val tokenType = claims.get("tokenType", String::class.java)
            if (tokenType != "account_setup")
                throw InvalidTokenException("Invalid token type. Expected 'account_setup', got '$tokenType'")

            if (claims.expiration.before(Date()))
                throw ExpiredTokenException("Account setup token has expired")

            return claims.extractUserId()  // ← robuste Integer/String

        } catch (e: ExpiredJwtException)  { throw ExpiredTokenException("Account setup token has expired") }
        catch (e: ExpiredTokenException)  { throw e }
        catch (e: InvalidTokenException)  { throw e }
        catch (e: Exception) {
            log.error("Error validating account setup token: ${e.message}")
            throw InvalidTokenException("Invalid account setup token")
        }
    }

    fun validateEmailChangeToken(token: String): String {
        try {
            val claims = getAllClaimsFromToken(token)

            val tokenType = claims.get("tokenType", String::class.java)
            if (tokenType != "email_change")
                throw InvalidTokenException("Invalid token type")

            if (claims.expiration.before(Date()))
                throw ExpiredTokenException("Email change token has expired")

            return claims.extractUserId()  // ← robuste Integer/String

        } catch (e: ExpiredJwtException)    { throw ExpiredTokenException("Email change token has expired") }
        catch (e: ExpiredTokenException)    { throw e }
        catch (e: InvalidTokenException)    { throw e }
        catch (e: UnsupportedJwtException)  { throw InvalidTokenException("Invalid token format") }
        catch (e: MalformedJwtException)    { throw InvalidTokenException("Invalid token format") }
        catch (e: SignatureException)       { throw InvalidTokenException("Invalid token signature") }
        catch (e: IllegalArgumentException) { throw InvalidTokenException("Token is empty") }
        catch (e: Exception) {
            log.error("Error validating email change token: ${e.message}")
            throw InvalidTokenException("Invalid token")
        }
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    fun getTokenTypeFromToken(token: String): String? =
        try { getAllClaimsFromToken(token).get("tokenType", String::class.java) }
        catch (e: Exception) { null }

    fun getNewEmailFromToken(token: String): String {
        val claims = getAllClaimsFromToken(token)
        if (claims.get("tokenType", String::class.java) != "email_change")
            throw InvalidTokenException("Invalid token type")
        return claims.get("newEmail", String::class.java)
            ?: throw InvalidTokenException("New email not found in token")
    }

    /** Robuste face aux anciens tokens avec userId Integer. */
    fun getUserIdFromToken(token: String): String =
        getAllClaimsFromToken(token).extractUserId()

    fun getEmailFromToken(token: String): String? {
        val claims = getAllClaimsFromToken(token)
        return claims.get("email", String::class.java) ?: claims.subject
    }

    fun getRoleFromToken(token: String): String? =
        try { getAllClaimsFromToken(token).get("role", String::class.java) }
        catch (e: Exception) { null }

    fun validateToken(token: String): Boolean =
        try { !getAllClaimsFromToken(token).expiration.before(Date()) }
        catch (e: Exception) { false }

    fun getUsernameFromToken(token: String): String? =
        try { getAllClaimsFromToken(token).subject }
        catch (e: Exception) { null }

    fun getAccessTokenExpiration(): Long  = accessTokenExpiration
    fun getRefreshTokenExpiration(): Long = refreshTokenExpiration
    fun getTokenExpirationSeconds(): Long = accessTokenExpiration / 1000

    private fun getAllClaimsFromToken(token: String): Claims =
        Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .body
}

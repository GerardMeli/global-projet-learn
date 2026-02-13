package com.example.recipeapi.configuration

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.security.Key
import java.util.*
import java.util.function.Function

@Component
class JwtUtils(

    @Value("\${app.secret-key}")
    private  var secretKey: String,

    @Value("\${app.expiration-time}")
    private var expirationTime: Long = 0
) {

    fun generateToken(username: String): String {
        var claims: Map<String, Object> = HashMap()
        return createToken(claims, username)
    }

    private fun createToken(claims: Map<String, Any>, subject: String): String {
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuedAt(Date(System.currentTimeMillis()))
            .setExpiration(Date(System.currentTimeMillis() + expirationTime))
            .signWith(getSignKey(), SignatureAlgorithm.HS256)
            .compact()
    }

    private fun getSignKey(): Key {
        val keyBytes: ByteArray = secretKey.toByteArray()
        return Keys.hmacShaKeyFor(keyBytes)
    }

    fun validateToken(token: String, userDetails: UserDetails): Boolean {
        val username: String = extractUsername(token)
        return username == userDetails.username && !isTokenExpired(token)
    }

    private fun isTokenExpired(token: String): Boolean {
        return extractExpirationDate(token).before(Date())
    }

    fun extractUsername(token: String): String {
        return extractClaim<String>(token, Claims::getSubject)
    }

    private fun extractExpirationDate(token: String): Date {
        return extractClaim<Date>(token, Claims::getExpiration)
    }

    private fun <T> extractClaim(token: String, claimsResolver: Function<Claims, T>): T {
        val claims = extractAllClaims(token)
        return claimsResolver.apply(claims)
    }

    private fun extractAllClaims(token: String): Claims {
        return Jwts.parserBuilder()
            .setSigningKey(getSignKey())
            .build()
            .parseClaimsJws(token)
            .body
    }

}

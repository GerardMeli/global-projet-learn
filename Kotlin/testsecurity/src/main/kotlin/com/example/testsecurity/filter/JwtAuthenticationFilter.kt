package com.example.testsecurity.filter

import com.example.testsecurity.service.JwtService
import com.fasterxml.jackson.databind.ObjectMapper
import io.jsonwebtoken.ExpiredJwtException
import io.jsonwebtoken.MalformedJwtException
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Instant


@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService,
    private val userDetailsService: UserDetailsService,
    private val objectMapper: ObjectMapper = ObjectMapper()
) : OncePerRequestFilter() {

    companion object {
//        private val logger = KotlinLogging.logger {}
        private const val BEARER_PREFIX = "Bearer "
        private const val AUTH_HEADER = "Authorization"
        private const val BEARER_PREFIX_LENGTH = 7

        // Public endpoints that don't require authentication
        private val PUBLIC_ENDPOINTS = setOf(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/public",
            "/api/auth/welcome",
            "/api/auth/verify-email",
            "/api/auth/reset-password",
            "/api/auth/request-password-reset"
        )

        // Documentation and static endpoints
        private val DOCUMENTATION_ENDPOINTS = setOf(
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/v3/api-docs",
            "/webjars/**",
            "/swagger-resources/**",
            "/swagger-ui.html",
            "/favicon.ico"
        )

        // Health and monitoring endpoints
        private val HEALTH_ENDPOINTS = setOf(
            "/actuator/health",
            "/actuator/info",
            "/actuator/prometheus"
        )
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        // Skip authentication for public endpoints
        if (shouldNotFilter(request)) {
            filterChain.doFilter(request, response)
            return
        }

        val authHeader = request.getHeader(AUTH_HEADER)

        // Check if Authorization header is present and valid
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            sendUnauthorizedError(response, "Missing or invalid Authorization header")
            return
        }

        val jwt = authHeader.substring(BEARER_PREFIX_LENGTH)

        try {
            // Validate access token
            if (!jwtService.validateAccessToken(jwt)) {
                sendUnauthorizedError(response, "Invalid or expired access token")
                return
            }

            // Extract username from token
            val username = jwtService.extractUsername(jwt)
            if (username.isNullOrEmpty()) {
                sendUnauthorizedError(response, "Invalid token payload")
                return
            }

            // Check if user is already authenticated
            if (SecurityContextHolder.getContext().authentication == null) {
                // Load user details
                val userDetails = try {
                    userDetailsService.loadUserByUsername(username)
                } catch (e: UsernameNotFoundException) {
                    logger.warn("User not found: $username")
                    sendUnauthorizedError(response, "User not found")
                    return
                }

                // Create authentication token
                val authentication = UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.authorities
                )

                // Set additional details
                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)

                // Set authentication in security context
                SecurityContextHolder.getContext().authentication = authentication

                // Set user info in request attributes for downstream use
                request.setAttribute("userId", userDetails.username)
                request.setAttribute("userAuthorities", userDetails.authorities)

                logger.debug("Authenticated user: $username with roles: ${userDetails.authorities}")
            }

        } catch (e: ExpiredJwtException) {
            logger.warn("JWT token expired: ${e.message}")
            sendUnauthorizedError(response, "Token expired", HttpServletResponse.SC_UNAUTHORIZED)
            return
        } catch (e: MalformedJwtException) {
            logger.warn("Malformed JWT token: ${e.message}")
            sendUnauthorizedError(response, "Invalid token format", HttpServletResponse.SC_BAD_REQUEST)
            return
        } catch (e: SecurityException) {
            logger.warn("JWT signature validation failed: ${e.message}")
            sendUnauthorizedError(response, "Invalid token signature", HttpServletResponse.SC_UNAUTHORIZED)
            return
        } catch (e: Exception) {
            logger.error("Unexpected error during authentication: ${e.message}", e)
            sendUnauthorizedError(response, "Authentication failed", HttpServletResponse.SC_INTERNAL_SERVER_ERROR)
            return
        }

        // Continue with the filter chain
        filterChain.doFilter(request, response)
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath

        // Check exact public endpoints
        if (PUBLIC_ENDPOINTS.contains(path)) {
            return true
        }

        // Check documentation endpoints using pattern matching
        if (DOCUMENTATION_ENDPOINTS.any { pattern ->
                path.matches(pattern.replace("**", ".*").toRegex())
            }) {
            return true
        }

        // Check health endpoints
        if (HEALTH_ENDPOINTS.contains(path)) {
            return true
        }

        // Check for preflight requests (CORS)
        if (request.method == "OPTIONS") {
            return true
        }

        return false
    }

    private fun sendUnauthorizedError(
        response: HttpServletResponse,
        message: String,
        statusCode: Int = HttpServletResponse.SC_UNAUTHORIZED
    ) {
        response.status = statusCode
        response.contentType = MediaType.APPLICATION_JSON_VALUE

        val errorResponse = mapOf(
            "timestamp" to Instant.now().toString(),
            "status" to statusCode,
            "error" to when (statusCode) {
                HttpServletResponse.SC_UNAUTHORIZED -> "Unauthorized"
                HttpServletResponse.SC_BAD_REQUEST -> "Bad Request"
                else -> "Internal Server Error"
            },
            "message" to message,
            "path" to ""
        )

        try {
            objectMapper.writeValue(response.writer, errorResponse)
        } catch (e: Exception) {
            logger.error("Failed to write error response", e)
        }
    }

    // Utility method to add additional security headers
    private fun addSecurityHeaders(response: HttpServletResponse) {
        response.setHeader("X-Content-Type-Options", "nosniff")
        response.setHeader("X-Frame-Options", "DENY")
        response.setHeader("X-XSS-Protection", "1; mode=block")

        // For API responses, we typically don't want to store credentials
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        response.setHeader("Pragma", "no-cache")
    }
}
package com.reli237.web_application_chat.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter

class JwtAuthenticationFilter (
    private val jwtProvider: JwtProvider,
    private val userDetailsService: UserDetailsService
) : OncePerRequestFilter() {

//    private val objectMapper = ObjectMapper()

    /**
     * Extract and validate JWT token from request
     */
    companion object {
        private val log = LoggerFactory.getLogger(JwtAuthenticationFilter::class.java)
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            // Extract JWT token from Authorization header
            val jwt = getJwtFromRequest(request)

            if (jwt?.isNotEmpty() == true && jwtProvider.validateToken(jwt)) {
                // Extract email from JWT (this is the key fix)
                val email = jwtProvider.getEmailFromToken(jwt)
                val userId = jwtProvider.getUserIdFromToken(jwt)
                val role = jwtProvider.getRoleFromToken(jwt)

                logger.debug("JWT validated - Email: $email, UserId: $userId, Role: $role")

                if (email?.isNotBlank() == true) {
                    // Load user by email
                    val userDetails = userDetailsService.loadUserByUsername(email)

                    // Create authentication token
                    val authorities = listOf(SimpleGrantedAuthority("ROLE_$role"))
                    val authentication = UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                    )

                    authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                    SecurityContextHolder.getContext().authentication = authentication

                    logger.debug("Authentication set for user: $email")
                } else {
                    logger.warn("JWT token does not contain email claim")
                }
            } else if (jwt?.isNotEmpty() == true ) {
                logger.warn("Invalid JWT token")
            }
        } catch (e: IllegalArgumentException) {
            logger.error("Could not set user authentication: ${e.message}")
        } catch (e: Exception) {
            logger.error("Could not parse authentication: ${e.message}", e)
        }

        filterChain.doFilter(request, response)
    }
    
    /**
     * Extract JWT token from Authorization header
     * Expected format: "Bearer {token}"
     */
    private fun getJwtFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else {
            null
        }
    }
}
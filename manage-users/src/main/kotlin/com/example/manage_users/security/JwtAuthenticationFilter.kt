package com.example.manage_users.security

import com.example.manage_users.service.interf.UsersService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter (
    private val jwtProvider: JwtProvider,
    private val userDetailsService: UserDetailsService
) : OncePerRequestFilter() {

    companion object {
        private val log = LoggerFactory.getLogger(JwtAuthenticationFilter::class.java)
    }

    /**
     * Empêche le filtre de s'exécuter sur les routes publiques de mot de passe.
     * Cela évite que le filtre tente d'interpréter le token de reset comme un token d'accès.
     */
    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        return path.startsWith("/api/auth/reset-password")
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val jwt = getJwtFromRequest(request)
            val token = extractToken(request)
            println("🔍 [manage-users] Token reçu: ${token?.take(50)}")

            // On valide d'abord la signature et l'expiration
            if (jwt?.isNotEmpty() == true && jwtProvider.validateToken(jwt)) {

                // CRUCIAL : On vérifie si c'est un token d'accès (login)
                val tokenType = jwtProvider.getTokenTypeFromToken(jwt)

                if (tokenType == "access") {
                    val email = jwtProvider.getEmailFromToken(jwt)
                    val role = jwtProvider.getRoleFromToken(jwt)

                    log.debug("JWT validated - Email: $email, Role: $role")

                    if (email?.isNotBlank() == true) {
                        val userDetails = userDetailsService.loadUserByUsername(email)

                        val authorities = if (role != null) {
                            listOf(SimpleGrantedAuthority("ROLE_$role"))
                        } else {
                            userDetails.authorities
                        }

                        val authentication = UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                        )

                        authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                        SecurityContextHolder.getContext().authentication = authentication

                        log.debug("Authentication set for user: $email")
                    }
                } else {
                    log.debug("Token ignored by filter: Type is $tokenType (not 'access')")
                }
            }
        } catch (e: Exception) {
            log.error("Could not set user authentication: ${e.message}")
        }

        filterChain.doFilter(request, response)
    }

    private fun getJwtFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else {
            null
        }
    }

    private fun extractToken(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else {
            null
        }
    }
}
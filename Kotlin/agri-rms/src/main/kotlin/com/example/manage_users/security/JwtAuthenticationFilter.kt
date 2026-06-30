package com.example.manage_users.security

import com.example.manage_users.service.impl.TokenServiceImpl
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
    private val userDetailsService: UserDetailsService,
    private val tokenServiceImpl: TokenServiceImpl
) : OncePerRequestFilter() {


    companion object {
        private val log = LoggerFactory.getLogger(JwtAuthenticationFilter::class.java)
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        return path.startsWith("/api/auth/reset-password")
                || path.startsWith("/api/auth/forgot-password")
                || path.startsWith("/api/auth/setup-password")
                || path.startsWith("/api/auth/verify-email")
                || path == "/reset-password.html"
                || path == "/setup-password.html"
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val jwt = getJwtFromRequest(request)

            if (!jwt.isNullOrEmpty() && jwtProvider.validateToken(jwt)) {

                // ── Vérification blacklist (token révoqué par logout) ─────────
                if (tokenServiceImpl.isBlacklisted(jwt)) {
                    log.debug("Rejected blacklisted token")
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token révoqué. Veuillez vous reconnecter.")
                    return
                }

                val tokenType = jwtProvider.getTokenTypeFromToken(jwt)

                if (tokenType == "access") {
                    val email = jwtProvider.getEmailFromToken(jwt)
                    val role  = jwtProvider.getRoleFromToken(jwt)

                    log.debug("JWT validated - Email: $email, Role: $role")

                    if (!email.isNullOrBlank()) {
                        val userDetails = userDetailsService.loadUserByUsername(email)

                        val authorities = if (role != null)
                            listOf(SimpleGrantedAuthority("ROLE_$role"))
                        else
                            userDetails.authorities

                        val authentication = UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities
                        )
                        authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                        SecurityContextHolder.getContext().authentication = authentication

                        log.debug("Authentication set for user: $email")
                    }
                } else {
                    log.debug("Token ignored by filter: type is $tokenType (not 'access')")
                }
            }
        } catch (e: Exception) {
            log.error("Could not set user authentication: ${e.message}")
        }

        filterChain.doFilter(request, response)
    }

    private fun getJwtFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer "))
            bearerToken.substring(7)
        else null
    }
}
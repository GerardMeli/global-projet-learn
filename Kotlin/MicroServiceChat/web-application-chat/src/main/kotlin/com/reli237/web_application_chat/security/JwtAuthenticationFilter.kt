package com.reli237.web_application_chat.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter (
    private val jwtProvider: JwtProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = extractToken(request)

        if (token != null && jwtProvider.validateToken(token)) {
            val email = jwtProvider.getEmailFromToken(token)
            val userId = jwtProvider.getUserIdFromToken(token)
            val role = jwtProvider.getRoleFromToken(token) ?: "USER"

            val authorities = listOf(SimpleGrantedAuthority("ROLE_$role"))
            val auth = UsernamePasswordAuthenticationToken(email, null, authorities)
            auth.details = WebAuthenticationDetailsSource().buildDetails(request)

            request.setAttribute("userId", userId)
            SecurityContextHolder.getContext().authentication = auth
            TokenContext.set(token) // ← AJOUT
        }

        try {
            filterChain.doFilter(request, response)
        } finally {
            TokenContext.clear() // ← AJOUT
        }
    }

    private fun extractToken(request: HttpServletRequest): String? {
        val header = request.getHeader("Authorization") ?: return null
        return if (header.startsWith("Bearer ")) header.substring(7) else null
    }
}
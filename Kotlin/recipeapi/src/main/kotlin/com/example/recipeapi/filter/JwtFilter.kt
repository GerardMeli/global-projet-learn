package com.example.recipeapi.filter

import com.example.recipeapi.configuration.JwtUtils
import com.example.recipeapi.service.CustomUserDetailsService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import lombok.NonNull
import lombok.RequiredArgsConstructor
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.security.web.context.SecurityContextHolderFilter
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
@RequiredArgsConstructor
class JwtFilter(
    private val customUserDetailsService: CustomUserDetailsService,
    private val jwtUtils: JwtUtils
): OncePerRequestFilter() {

    protected override fun doFilterInternal(
        @NonNull request: HttpServletRequest,
        @NonNull response: HttpServletResponse,
        @NonNull filterChain: FilterChain
    ) {
        val authHeader: String? = request.getHeader("Authorization")

        var username: String? = null
        var jwt: String = ""

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7)
            username = jwtUtils.extractUsername(jwt)
        }

        if (username != null && SecurityContextHolder.getContext().authentication == null) {
            val userDetails: UserDetails = customUserDetailsService.loadUserByUsername(username)

            if (jwtUtils.validateToken(jwt, userDetails)) {
                val authenticationToken = UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.authorities
                )
                authenticationToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = authenticationToken
            }
        }

        filterChain.doFilter(request, response)
    }

}
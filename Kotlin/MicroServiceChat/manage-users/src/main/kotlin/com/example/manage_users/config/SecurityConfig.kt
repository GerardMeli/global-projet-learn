package com.example.manage_users.config

import com.example.manage_users.security.JwtAuthenticationFilter
import com.example.manage_users.security.JwtProvider
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.client.RestTemplate
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val userDetailsService: UserDetailsService,
    private val jwtProvider: JwtProvider
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .exceptionHandling { exception ->
                exception
                    .authenticationEntryPoint { request, response, authException ->
                        response.contentType = "application/json"
                        response.status = HttpStatus.UNAUTHORIZED.value()
                        response.writer.write("""
                        {
                            "success": false,
                            "message": "Unauthorized: ${authException.message}",
                            "timestamp": ${System.currentTimeMillis()}
                        }
                        """.trimIndent())
                    }
                    .accessDeniedHandler { request, response, accessDeniedException ->
                        response.contentType = "application/json"
                        response.status = HttpStatus.FORBIDDEN.value()
                        response.writer.write("""
                        {
                            "success": false,
                            "message": "Access Denied: ${accessDeniedException.message}",
                            "timestamp": ${System.currentTimeMillis()}
                        }
                        """.trimIndent())
                    }
            }
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authorizeHttpRequests { authz ->
                authz
                    // Public routes
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // ← ADD THIS FIRST
                    .requestMatchers("/", "/login", "/favicon.ico").permitAll()
                    .requestMatchers( "/register").permitAll()
                    .requestMatchers("/api/embed/verify").permitAll()  // ← AJOUTER CETTE LIGNE
                    .requestMatchers("/resources/**", "/static/**", "/public/**", "/css/**", "/js/**").permitAll()
                    .requestMatchers("/error").permitAll()
                    .requestMatchers("/api/auth/social").permitAll()
//                    .requestMatchers("/ws-chat/**").permitAll() // Allow WebSocket handshake


                    // Swagger/OpenAPI
                    .requestMatchers(
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml",
                        "/swagger-resources/**",
                        "/webjars/**"
                    ).permitAll()

                    // OAuth2 endpoints
                    .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()

                    // Auth endpoints (public)
                    // ⚠️ /register est volontairement absent : seul l'admin peut créer des comptes
                    //    via POST /api/admin/users/
                    .requestMatchers("/api/auth/login").permitAll()
                    .requestMatchers("/api/auth/refresh-token").permitAll()
                    .requestMatchers("/api/auth/verify-email").permitAll()
                    .requestMatchers("/api/auth/resend-verification").permitAll()
                    .requestMatchers("/api/auth/forgot-password").permitAll()
                    .requestMatchers("/api/auth/reset-password").permitAll()
                    .requestMatchers("/auth/system/**").permitAll()

                    // Register : réservé aux admins uniquement
//                    .requestMatchers("/api/auth/register").hasAnyRole("ADMIN", "SUPER_ADMIN")
                    .requestMatchers("/api/admin/migration/single").hasAnyRole("ADMIN", "SUPER_ADMIN")
                    .requestMatchers("/api/admin/migration/run").hasAnyRole("ADMIN", "SUPER_ADMIN")

                    // Profile endpoints (require authentication)
                    .requestMatchers("/api/profile/**").permitAll()

                    // Admin endpoints (require ADMIN role)
                    .requestMatchers("/api/admin/users/*/basic").authenticated()
                    .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                    // Statistics endpoints (require ADMIN role)
                    .requestMatchers("/api/admin/statistics/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                    // All other requests require authentication
                    .anyRequest().authenticated()
            }
            .addFilterBefore(
                JwtAuthenticationFilter(jwtProvider, userDetailsService),
                UsernamePasswordAuthenticationFilter::class.java
            )
            .userDetailsService(userDetailsService)
            .build()
    }

    @Bean
    fun authenticationManager(
        authenticationConfiguration: AuthenticationConfiguration
    ): AuthenticationManager {
        return authenticationConfiguration.authenticationManager
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val corsConfig = CorsConfiguration().apply {
            allowedOrigins = listOf(
                "http://localhost:8080",
                "http://localhost:8081",
                "http://localhost:8082",
                "http://localhost:4200",
                "http://127.0.0.1:5500",
                // Site agriculture — autorisé à appeler les APIs chat
                "http://web-chat.connecttechnology.io",
                "https://web-chat.connecttechnology.io"
            )
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            allowedHeaders = listOf(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "X-User-Id"  // Add this header
            )
            exposedHeaders = listOf(
                "Authorization",
                "Content-Type",
                "X-Session-Id"
            )
            maxAge = 3600L
            allowCredentials = true
        }

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", corsConfig)
        return source
    }

    @Bean
    fun restTemplate(): RestTemplate = RestTemplate()
}
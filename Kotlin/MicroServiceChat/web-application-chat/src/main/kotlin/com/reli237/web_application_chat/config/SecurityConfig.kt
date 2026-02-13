package com.reli237.web_application_chat.config

import com.reli237.web_application_chat.security.CustomUserDetailsService
import com.reli237.web_application_chat.security.JwtAuthenticationFilter
import com.reli237.web_application_chat.security.JwtProvider
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
//@EnableGlobalMethodSecurity(
//    prePostEnabled = true,
//    securedEnabled = true,
//    jsr250Enabled = true
//)
class SecurityConfig(
    private val userDetailsService: UserDetailsService,
    private val jwtProvider: JwtProvider,
) {

    /**
     * Configure HTTP security using SecurityFilterChain (Spring Security 6.1+)
     */
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
                // IMPORTANT: Si vous utilisez JWT, passez en STATELESS
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authorizeHttpRequests { authz ->
                authz
                    // Routes publiques
                    .requestMatchers("/", "/login", "/register", "/favicon.ico").permitAll()
                    .requestMatchers("/resources/**", "/static/**", "/public/**", "/css/**", "/js/**").permitAll()
                    .requestMatchers("/error").permitAll()

                    // Documentation API
                    .requestMatchers(
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml",
                        "/swagger-resources/**",
                        "/webjars/**"
                    ).permitAll()

                    // API Authentication - publiques
                    .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/auth/check-email").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/users/date-range").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/users/").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/users/role/{role}").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/users/{id}").permitAll()

                    // WebSocket endpoints - permit all (authentication happens in WebSocket message handlers)
                    .requestMatchers("/ws-chat", "/ws-chat/**").permitAll()

                    // User endpoints - require authentication
                    .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/auth/refresh-token").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/auth/validate-token").authenticated()

                    // User management endpoints
//                    .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/users/{id}").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/users/{id}").hasAnyRole("ADMIN")

                    // Chat room endpoints
                    .requestMatchers(HttpMethod.GET, "/api/chatrooms/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/chatrooms/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/chatrooms/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/chatrooms/**").hasAnyRole("ADMIN")

                    // Chat participant endpoints
                    .requestMatchers(HttpMethod.GET, "/api/participants/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/participants/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/participants/**").authenticated()

                    // Message endpoints
                    .requestMatchers(HttpMethod.GET, "/api/messages/**").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/messages/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/messages/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/messages/**").authenticated()

                    // One to one endPoints
                    .requestMatchers(HttpMethod.GET, "/conversation/*").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/conversation/messages/*/read").authenticated()
                    .requestMatchers(HttpMethod.POST, "/conversation/*/read").authenticated()
                    .requestMatchers(HttpMethod.GET, "/conversations").authenticated()

                    // Toutes les autres routes nécessitent une authentification
                    .anyRequest().authenticated()
            }
            .addFilterBefore(
                JwtAuthenticationFilter(jwtProvider, userDetailsService),
                UsernamePasswordAuthenticationFilter::class.java
            )
            .build()
    }

    /**
     * Configure authentication manager
     */
    @Bean
    fun authenticationManager(
        authenticationConfiguration: AuthenticationConfiguration
    ): AuthenticationManager {
        return authenticationConfiguration.authenticationManager
    }


    /**
     * Password encoder bean
     */
    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    /**
     * CORS configuration bean
     */
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val corsConfig = CorsConfiguration().apply {
            allowedOrigins = listOf(
                "http://localhost:3000",  // React dev server
                "http://localhost:5173",  // Vite dev server
                "http://localhost:8080"   // Spring Boot
            )
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            allowedHeaders = listOf(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
            )
            exposedHeaders = listOf(
                "Authorization",
                "Content-Type",
                "X-Session-Id"
            )
            maxAge = 3600L
            allowCredentials = true  // Important pour les cookies/sessions
        }

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", corsConfig)
        return source
    }
}
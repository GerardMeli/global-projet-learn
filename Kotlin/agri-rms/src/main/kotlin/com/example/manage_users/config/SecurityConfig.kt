package com.example.manage_users.config

import com.example.manage_users.security.CustomUserDetailsService
import com.example.manage_users.security.JwtAuthenticationFilter
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.security.OAuth2AuthenticationSuccessHandler
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
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

// ─────────────────────────────────────────────────────────────────────────────
//  SecurityConfig
//
//  Matrice d'accès :
//  ┌─────────────────────────┬─────────────────┬─────────────────────────────┐
//  │ Endpoint                │ CREATE / DELETE │ READ / UPDATE               │
//  ├─────────────────────────┼─────────────────┼─────────────────────────────┤
//  │ /api/super-admins/**    │ SUPER_ADMIN     │ SUPER_ADMIN                 │
//  │ /api/d-generales/**     │ SUPER_ADMIN     │ SUPER_ADMIN + D_GENERALE    │
//  │ /api/d-plantations/**   │ SUPER_ADMIN     │ SUPER_ADMIN + D_GENERALE    │
//  │ /api/respo-stocks/**    │ SUPER_ADMIN     │ SUPER_ADMIN + D_GENERALE    │
//  │ /api/ag-terrains/**     │ SUPER_ADMIN     │ SUPER_ADMIN + D_GENERALE    │
//  │ /api/ag-collectes/**    │ SUPER_ADMIN     │ SUPER_ADMIN + D_GENERALE    │
//  └─────────────────────────┴─────────────────┴─────────────────────────────┘
//
//  Note : La granularité CREATE/UPDATE/DELETE est gérée via @PreAuthorize
//         au niveau des controllers et des services (double sécurité).
// ─────────────────────────────────────────────────────────────────────────────
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val customUserDetailsService: CustomUserDetailsService
) {

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun authenticationProvider(): DaoAuthenticationProvider =
        DaoAuthenticationProvider().apply {
            setUserDetailsService(customUserDetailsService)
            setPasswordEncoder(passwordEncoder())
        }

    @Bean
    fun authenticationManager(config: AuthenticationConfiguration): AuthenticationManager =
        config.authenticationManager

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { it.configurationSource(corsConfigurationSource()) }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    // ── Routes publiques ─────────────────────────────────────
                    .requestMatchers(
                        "/api/auth/login",
                        "/api/auth/refresh-token",
                        "/api/auth/forgot-password",
                        "/api/auth/reset-password",
                        "/api/auth/reset-password/form",
                        "/api/auth/verify-email",
                        "/api/auth/verify-email/form",
                        "/api/auth/setup-password",
                        "/api/auth/resend-verification",
                        "/actuator/health",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/reset-password.html",
                        "/reset-password",
                        "/setup-password.html",        // ← page HTML statique
                        "/setup-password",        // ← page HTML statique
                        "/*.html",                     // ← toutes les pages statiques
                        "/static/**",                  // ← ressources statiques
                        "/error",
                        "/favicon.ico"
                    ).permitAll()         // ← page d'erreur Spring


                    // ── SUPER_ADMIN uniquement ───────────────────────────────
                    .requestMatchers("/api/super-admins/**")
                    .hasRole("SUPER_ADMIN")

                    // ── D_GENERALE : CREATE et DELETE réservés SUPER_ADMIN ──
                    .requestMatchers(HttpMethod.POST, "/api/d-generales/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/d-generales/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/d-generales/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PUT, "/api/d-generales/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PATCH, "/api/d-generales/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")

                    // ── D_PLANTATION ─────────────────────────────────────────
                    .requestMatchers(HttpMethod.POST, "/api/d-plantations/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/d-plantations/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/d-plantations/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PUT, "/api/d-plantations/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PATCH, "/api/d-plantations/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")

                    // ── RESPO_STOCK ──────────────────────────────────────────
                    .requestMatchers(HttpMethod.POST, "/api/respo-stocks/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/respo-stocks/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/respo-stocks/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PUT, "/api/respo-stocks/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PATCH, "/api/respo-stocks/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")

                    // ── AG_TERRAIN ────────────────────────────────────────────
                    .requestMatchers(HttpMethod.POST, "/api/ag-terrains/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/ag-terrains/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/ag-terrains/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PUT, "/api/ag-terrains/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PATCH, "/api/ag-terrains/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")

                    // ── AG_COLLECTE ──────────────────────────────────────────
                    .requestMatchers(HttpMethod.POST, "/api/ag-collectes/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/ag-collectes/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/ag-collectes/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PUT, "/api/ag-collectes/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")
                    .requestMatchers(HttpMethod.PATCH, "/api/ag-collectes/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE")

                    // ── FARM endpoints ───────────────────────────────────────
                    // GET: accessible à tous les utilisateurs authentifiés
                    .requestMatchers(HttpMethod.GET, "/api/farms/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE", "D_PLANTATION", "AG_TERRAIN", "AG_COLLECTE", "RESPO_STOCK")

                    // POST/CREATE: réservé à SUPER_ADMIN et D_PLANTATION (basé sur @PreAuthorize dans le controller)
                    .requestMatchers(HttpMethod.POST, "/api/farms/**")
                    .hasAnyRole( "D_PLANTATION")

                    // PUT/UPDATE: réservé à SUPER_ADMIN et D_PLANTATION (basé sur @PreAuthorize)
                    .requestMatchers(HttpMethod.PUT, "/api/farms/**")
                    .hasAnyRole( "D_PLANTATION")
                    .requestMatchers(HttpMethod.PATCH, "/api/farms/**")
                    .hasAnyRole( "D_PLANTATION")

                    // DELETE: réservé à SUPER_ADMIN uniquement
                    .requestMatchers(HttpMethod.DELETE, "/api/farms/**")
                    .hasRole("D_PLANTATION")

                    // ── PLOT endpoints ───────────────────────────────────────
                    // GET: accessible à tous les utilisateurs authentifiés
                    .requestMatchers(HttpMethod.GET, "/api/plots/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE", "D_PLANTATION", "AG_TERRAIN", "AG_COLLECTE", "RESPO_STOCK")

                    // POST/CREATE: réservé à SUPER_ADMIN et D_PLANTATION (basé sur @PreAuthorize)
                    .requestMatchers(HttpMethod.POST, "/api/plots/**")
                    .hasAnyRole("D_PLANTATION")

                    // PUT/UPDATE: réservé à SUPER_ADMIN et D_PLANTATION (basé sur @PreAuthorize)
                    .requestMatchers(HttpMethod.PUT, "/api/plots/**")
                    .hasAnyRole( "D_PLANTATION")

                    // DELETE: réservé à SUPER_ADMIN uniquement (basé sur @PreAuthorize)
                    .requestMatchers(HttpMethod.DELETE, "/api/plots/**")
                    .hasRole("D_PLANTATION")

                    // ── ACTIVITY endpoints ───────────────────────────────────
                    // GET: accessible à tous les utilisateurs authentifiés
                    .requestMatchers(HttpMethod.GET, "/api/activities/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE", "D_PLANTATION", "AG_TERRAIN", "AG_COLLECTE", "RESPO_STOCK")

                    // POST/CREATE: réservé à D_PLANTATION (basé sur @PreAuthorize)
                    .requestMatchers(HttpMethod.POST, "/api/activities/**")
                    .hasAnyRole("D_PLANTATION")

                    // PUT/UPDATE: réservé à D_PLANTATION et AG_TERRAIN (basé sur @PreAuthorize)
                    .requestMatchers(HttpMethod.PUT, "/api/activities/**")
                    .hasAnyRole("D_PLANTATION", "AG_TERRAIN")
                    .requestMatchers(HttpMethod.PATCH, "/api/activities/**")
                    .hasAnyRole("D_PLANTATION", "AG_TERRAIN")

                    // DELETE: réservé à D_PLANTATION (basé sur @PreAuthorize)
                    .requestMatchers(HttpMethod.DELETE, "/api/activities/**")
                    .hasAnyRole("D_PLANTATION")

                    // ── STOCK endpoints ──────────────────────────────────────
                    // GET: accessible à tous les utilisateurs authentifiés
                    .requestMatchers(HttpMethod.GET, "/api/stocks/**")
                    .hasAnyRole("SUPER_ADMIN", "D_GENERALE", "D_PLANTATION", "AG_TERRAIN", "AG_COLLECTE", "RESPO_STOCK")

                    // POST/CREATE: réservé à RESPO_STOCK (basé sur @PreAuthorize)
                    .requestMatchers(HttpMethod.POST, "/api/stocks/**")
                    .hasAnyRole("RESPO_STOCK")

                    // PUT/UPDATE: réservé à RESPO_STOCK (basé sur @PreAuthorize)
                    .requestMatchers(HttpMethod.PUT, "/api/stocks/**")
                    .hasAnyRole("RESPO_STOCK")

                    // PATCH /quantity, /add, /remove — ** en fin, granularité via @PreAuthorize
                    .requestMatchers(HttpMethod.PATCH, "/api/stocks/**")
                    .hasAnyRole("AG_COLLECTE", "RESPO_STOCK")
                    .requestMatchers(HttpMethod.POST, "/api/stocks/**")
                    .hasAnyRole("AG_COLLECTE", "RESPO_STOCK")

                    // DELETE: réservé à RESPO_STOCK
                    .requestMatchers(HttpMethod.DELETE, "/api/stocks/**")
                    .hasAnyRole("RESPO_STOCK")

                    // Critical stocks endpoints
                    .requestMatchers("/api/stocks/critical/**")
                    .hasAnyRole("SUPER_ADMIN", "RESPO_STOCK", "D_GENERALE")
                    .requestMatchers("/api/stocks/check-alerts")
                    .hasAnyRole("SUPER_ADMIN", "AG_COLLECTE", "RESPO_STOCK")

                    // Statistics endpoints — /api/**/statistics remplacé par pattern valide
                    .requestMatchers(HttpMethod.GET, "/api/stats/**").hasAnyRole("SUPER_ADMIN")

                    // ── Toute autre requête authentifiée ─────────────────────
                    .anyRequest().authenticated()
            }
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration().apply {
            allowedOriginPatterns = listOf("*")
            allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
            maxAge = 3600L
        }
        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", config)
        }
    }
}

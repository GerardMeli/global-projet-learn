package com.example.manage_users.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter

// ─────────────────────────────────────────────────────────────────────────────
//  CorsConfig
//
//  Autorise Angular (http://localhost:4200) à appeler le backend Spring Boot.
//  Permet également les appels depuis la page HTML statique servie par le backend.
//
//  ⚠️  En production : remplacer allowedOrigins par le domaine réel de ton frontend.
// ─────────────────────────────────────────────────────────────────────────────

@Configuration
class CorsConfig {

    @Bean
    fun corsFilter(): CorsFilter {
        val config = CorsConfiguration().apply {
            // Origines autorisées : Angular dev + la page HTML servie par le backend
            allowedOrigins = listOf(
                "http://localhost:4200",   // Angular dev server
                "http://localhost:8083",    // page setup-password.html servie par Spring Boot
                "http://194.163.170.202:8083"
            )
            // Méthodes HTTP autorisées
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            // Headers autorisés (Authorization pour les tokens JWT)
            allowedHeaders = listOf("*")
            // Exposer Authorization dans la réponse si nécessaire
            exposedHeaders = listOf("Authorization")
            // Autoriser les cookies / credentials
            allowCredentials = true
            // Cache preflight pendant 1 heure
            maxAge = 3600L
        }

        val source = UrlBasedCorsConfigurationSource()
        // Appliquer la config CORS à tous les endpoints
        source.registerCorsConfiguration("/**", config)
        return CorsFilter(source)
    }

}
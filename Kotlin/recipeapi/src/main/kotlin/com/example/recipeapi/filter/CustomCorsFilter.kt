package com.example.recipeapi.filter

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter
import java.util.List

//@Component
@Configuration
class CustomCorsFilter(

    @Value("\${app.frontend-url}")
    private val frontendUrl: String
) {

    @Bean
    fun coresFilter() : CorsFilter {
        val config = CorsConfiguration()
        // ✅ SINGLE origin (recommended)
        config.allowedOrigins = listOf(frontendUrl)
        config.allowedMethods = listOf(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        )
        config.allowedHeaders = listOf("Authorization", "Content-Type", "Cache-Control")
        config.exposedHeaders = listOf("Authorization")

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", config)
        return CorsFilter(source)
    }

}
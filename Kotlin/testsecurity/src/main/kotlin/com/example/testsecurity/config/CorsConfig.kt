package com.example.testsecurity.config

import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Bean
import org.springframework.web.filter.CorsFilter
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource
import org.springframework.web.cors.CorsConfiguration

@Configuration
class CorsConfig {
    
    // @Bean
    // fun corsFilter(): CorsFilter {
    //     val source = UrlBasedCorsConfigurationSource()
    //     val config = CorsConfiguration()
        
    //     // Allow all origins (or specify your frontend URL)
    //     config.allowedOrigins = listOf("*")
    //     config.allowedMethods = listOf("GET", "POST", "PUT", "OPTIONS", "PATCH")
    //     config.allowedHeaders = listOf(
    //         "Authorization",
    //         "Content-Type",
    //         "X-Requested-With",
    //         "Accept",
    //         "Origin",
    //         "Access-Control-Request-Method",
    //         "Access-Control-Request-Headers"
    //     )
    //     config.exposedHeaders = listOf(
    //         "Access-Control-Allow-Origin",
    //         "Access-Control-Allow-Credentials",
    //         "Authorization"
    //     )
    //     config.allowCredentials = false
    //     config.maxAge = 3600L
        
    //     source.registerCorsConfiguration("/**", config)
    //     return CorsFilter(source)
    // }
}
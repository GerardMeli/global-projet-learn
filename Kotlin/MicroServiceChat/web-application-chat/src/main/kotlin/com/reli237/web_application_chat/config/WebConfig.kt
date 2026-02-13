package com.reli237.web_application_chat.config

import com.reli237.web_application_chat.security.AuthInterceptor
import com.reli237.web_application_chat.security.HttpAuthInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig (
    private val httpAuthInterceptor: HttpAuthInterceptor
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(httpAuthInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns(
                "/",
                "/login",
                "/register",
                "/api/auth/**",
                "/css/**",
                "/js/**",
                "/images/**",
                "/webjars/**",
                "/swagger-ui/**",
                "/v3/api-docs/**"
            )
    }
}
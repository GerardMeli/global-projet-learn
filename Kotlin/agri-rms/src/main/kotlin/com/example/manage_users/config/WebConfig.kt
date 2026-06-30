package com.example.manage_users.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/*
─────────────────────────────────────────────────────────────────────────────
WebConfig

Sert les fichiers HTML statiques placés dans resources/static/.

La page setup-password.html sera accessible à :
http://localhost:8082/setup-password.html

Le lien dans l'email d'invitation sera donc :
http://localhost:8082/setup-password.html?token=eyJ...

La page appelle ensuite POST /api/auth/setup-password (backend)
puis redirige vers http://localhost:4200/auth/login (Angular).
─────────────────────────────────────────────────────────────────────────────
*/

@Configuration
class WebConfig : WebMvcConfigurer {


    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry
            .addResourceHandler("/static/**")
            .addResourceLocations("classpath:/static/")
            .setCachePeriod(0)
    }

    override fun configureContentNegotiation(configurer: ContentNegotiationConfigurer) {
        configurer
            .favorPathExtension(false)
            .favorParameter(false)
            .ignoreAcceptHeader(false)
    }

}
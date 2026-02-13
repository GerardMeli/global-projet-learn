package com.reli237.web_application_chat.config

import feign.RequestInterceptor
import feign.codec.ErrorDecoder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes

@Configuration
class FeignConfig{

    @Bean
    fun requestInterceptor(): RequestInterceptor {
        return RequestInterceptor { template ->
            // Récupérer le token JWT de la requête actuelle et le propager
            val requestAttributes = RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes
            val token = requestAttributes?.request?.getHeader("Authorization")

            if (!token.isNullOrBlank()) {
                template.header("Authorization", token)
            }
        }
    }

    @Bean
    fun errorDecoder(): ErrorDecoder {
        return ErrorDecoder { methodKey, response ->
            when (response.status()) {
                401 -> RuntimeException("Non autorisé - Veuillez vous reconnecter")
                403 -> RuntimeException("Accès interdit")
                404 -> RuntimeException("Ressource non trouvée dans le service Users")
                500 -> RuntimeException("Erreur interne du service Users")
                else -> RuntimeException("Erreur lors de la communication avec le service Users")
            }
        }
    }
}
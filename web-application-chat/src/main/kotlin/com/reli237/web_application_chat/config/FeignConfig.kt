package com.reli237.web_application_chat.config

import com.reli237.web_application_chat.security.TokenContext
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
            val httpToken = try {
                val attrs = RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes
                attrs?.request?.getHeader("Authorization")
            } catch (e: Exception) { null }

            val token = httpToken ?: TokenContext.get()

            if (!token.isNullOrBlank()) {
                val authHeader = if (token.startsWith("Bearer ")) token else "Bearer $token"
                template.header("Authorization", authHeader)
                println("🔑 [Feign] Token propagé: $authHeader") // ← log complet temporaire
            } else {
                println("⚠️ [Feign] Aucun token disponible")
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
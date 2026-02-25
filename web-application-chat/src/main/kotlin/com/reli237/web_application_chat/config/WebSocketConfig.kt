package com.reli237.web_application_chat.config

import com.reli237.web_application_chat.security.AuthInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.ChannelRegistration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
@EnableScheduling
class WebSocketConfig(
    private val authInterceptor: AuthInterceptor
) : WebSocketMessageBrokerConfigurer {

    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        // Préfixe pour les messages envoyés AU serveur
        config.setApplicationDestinationPrefixes("/app")

        // Préfixe pour les messages envoyés PAR le serveur aux clients
        // /topic = messages publics (broadcast)
        // /queue = messages privés (dirigés vers un utilisateur spécifique)
        // Add file-related topics
        config.enableSimpleBroker(
            "/topic",
            "/queue",
            "/topic/files",     // For file upload notifications
            "/topic/room",      // Room-specific notifications
            "/user"            // User-specific notifications
        )

        // Préfixe pour les messages privés dirigés vers un utilisateur
        config.setUserDestinationPrefix("/user")
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        // Endpoint WebSocket unique et cohérent
        registry.addEndpoint("/ws-chat")
            .setAllowedOriginPatterns("*")  // À adapter en production!
            .withSockJS()  // Fallback pour les navigateurs sans WebSocket natif

        // Add separate endpoint for file uploads if needed
        registry.addEndpoint("/ws-files")
            .setAllowedOriginPatterns("*")
            .withSockJS()
    }

    override fun configureClientInboundChannel(registration: ChannelRegistration) {
        // Ajouter l'intercepteur d'authentification
        registration.interceptors(authInterceptor)
    }
}
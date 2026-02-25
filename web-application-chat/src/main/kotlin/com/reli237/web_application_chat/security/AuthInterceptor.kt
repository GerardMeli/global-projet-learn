// src/main/kotlin/com/reli237/web_application_chat/security/AuthInterceptor.kt

package com.reli237.web_application_chat.security

import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompCommand
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.stereotype.Component

@Component
class AuthInterceptor : ChannelInterceptor {

    override fun preSend(message: Message<*>, channel: MessageChannel): Message<*> {
        val accessor = StompHeaderAccessor.wrap(message)
        val command = accessor.command

        // Logs de débogage
        println("🔌 [AuthInterceptor] STOMP Command: $command")

        when (command) {
            StompCommand.CONNECT -> {
                println("🔗 [AuthInterceptor] CONNECT - Vérifiant les credentials...")
                handleConnect(accessor)
            }
            StompCommand.SEND -> {
                println("✉️ [AuthInterceptor] SEND - Vérifiant l'utilisateur...")
                handleSend(accessor)
            }
            else -> {
                println("📤 [AuthInterceptor] Autre commande: $command")
            }
        }

        return message
    }

    private fun handleConnect(accessor: StompHeaderAccessor) {
        // ✅ Récupérer le token JWT via getFirstNativeHeader()
        val authHeader = accessor.getFirstNativeHeader("Authorization")
        println("🔑 [AuthInterceptor] Authorization Header: ${authHeader?.take(30) ?: "null"}...")

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            println("❌ [AuthInterceptor] CONNECT: Token manquant ou invalide!")
            throw IllegalArgumentException("Authorization header is missing or invalid")
        }

        val token = authHeader.removePrefix("Bearer ")
        println("✅ [AuthInterceptor] Token valid")

        // ✅ Récupérer l'userId du header X-User-Id
        val userIdHeader = accessor.getFirstNativeHeader("X-User-Id")
        println("👤 [AuthInterceptor] X-User-Id Header: $userIdHeader")

        val userId = userIdHeader?.toLongOrNull()
        println("🆔 [AuthInterceptor] Extracted User ID: $userId")

        if (userId == null) {
            println("❌ [AuthInterceptor] CONNECT: User ID introuvable!")
            throw IllegalArgumentException("X-User-Id header is missing or invalid")
        }

        // ✅ Stocker l'userId et token dans la session pour l'utiliser plus tard
        val sessionAttributes = accessor.sessionAttributes
        if (sessionAttributes != null) {
            sessionAttributes["userId"] = userId
            sessionAttributes["token"] = token
            println("✅ [AuthInterceptor] CONNECT: User ID $userId stocké dans la session")
        } else {
            println("⚠️ [AuthInterceptor] CONNECT: Pas de sessionAttributes disponibles")
        }
    }

    private fun handleSend(accessor: StompHeaderAccessor) {
        // ✅ Récupérer l'userId de la session
        val sessionAttributes = accessor.sessionAttributes
        val userId = sessionAttributes?.get("userId") as? Long

        // ✅ Alternative: Récupérer du header si pas en session
        val userIdFromHeader = accessor.getFirstNativeHeader("X-User-Id")?.toLongOrNull()
        val finalUserId = userId ?: userIdFromHeader

        println("👤 [AuthInterceptor] SEND User ID from session: $userId")
        println("👤 [AuthInterceptor] SEND User ID from header: $userIdFromHeader")
        println("👤 [AuthInterceptor] SEND Final User ID: $finalUserId")

        if (finalUserId == null) {
            println("❌ [AuthInterceptor] SEND: Utilisateur non authentifié!")
            throw IllegalArgumentException("User not authenticated")
        }

        println("✅ [AuthInterceptor] SEND: Utilisateur authentifié (ID: $finalUserId)")
    }
}
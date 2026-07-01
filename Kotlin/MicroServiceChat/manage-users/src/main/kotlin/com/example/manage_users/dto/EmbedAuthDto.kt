package com.example.manage_users.dto

// ─── Requête reçue depuis l'iframe ───────────────────────────────────────────
data class EmbedVerifyRequest(
    val uid: String,       // ID de l'user côté Agriculture
    val email: String,     // Email de l'user
    val token: String      // JWT Agriculture
)

// ─── Réponse retournée au frontend Chat ──────────────────────────────────────
data class EmbedVerifyResponse(
    val valid: Boolean,
    val chatToken: String? = null,   // JWT Chat généré si valid = true
    val chatUserId: String? = null,  // ID interne dans la table users du Chat
    val email: String? = null,
    val message: String? = null      // Message d'erreur si valid = false
)

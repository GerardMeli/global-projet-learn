package com.example.manage_users.dto

/**
* ─────────────────────────────────────────────────────────────────────────────
*  DTOs pour l'authentification sociale
* ─────────────────────────────────────────────────────────────────────────────
*/

/**
 * Requête envoyée par le frontend après que Firebase a authentifié l'utilisateur.
 *
 * Flux complet côté frontend :
 *   1. L'utilisateur clique "Sign in with Google"
 *   2. Firebase JS SDK ouvre le popup OAuth
 *   3. Firebase retourne un UserCredential
 *   4. Le frontend appelle userCredential.user.getIdToken()
 *   5. Ce token est envoyé ici dans [idToken]
 */
data class SocialAuthRequest(
    /**
     * JWT signé par Firebase (durée de vie 1h).
     * Le backend le vérifie avec le SDK Admin Firebase.
     */
    val idToken: String,

    /**
     * Provider utilisé côté frontend : "google", "github", "facebook"
     * Utilisé uniquement pour les logs/analytics.
     * Le vrai provider est lu depuis le token Firebase lui-même.
     */
    val provider: String
)

/**
 * Réponse retournée au frontend après authentification sociale réussie.
 * Même structure que la réponse du login classique pour cohérence.
 */
data class SocialAuthResponse(
    val success: Boolean = true,
    val data: SocialAuthData
)

data class SocialAuthData(
    /** JWT applicatif à stocker dans localStorage / sessionStorage */
    val token: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long,
    val user: SocialUserSummary,
    /** true si c'est la première connexion (compte créé à l'instant) */
    val isNewUser: Boolean
)

data class SocialUserSummary(
    val id: String,
    val email: String,
    val firstName: String?,
    val lastName: String?,
    val profilePicture: String?,
    val role: String
)

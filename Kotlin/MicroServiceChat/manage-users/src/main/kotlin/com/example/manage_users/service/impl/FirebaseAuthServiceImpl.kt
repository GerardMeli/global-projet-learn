package com.example.manage_users.service.impl

import com.example.manage_users.service.interf.FirebaseAuthService
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthException
import com.google.firebase.auth.FirebaseToken
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FirebaseAuthService
 *  Responsabilité unique : valider les tokens Firebase envoyés par le frontend.
 *
 *  Le SDK Admin contacte les serveurs Firebase pour vérifier :
 *   - La signature cryptographique du JWT
 *   - La date d'expiration (1 heure par défaut)
 *   - L'audience (ton projectId)
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Service
class FirebaseAuthServiceImpl : FirebaseAuthService {

    private val log = LoggerFactory.getLogger(FirebaseAuthService::class.java)

    /**
     * Vérifie et décode un idToken Firebase.
     *
     * @param idToken Le JWT Firebase envoyé par le frontend (user.getIdToken())
     * @return FirebaseToken décodé (uid, email, name, picture, claims, etc.)
     * @throws IllegalArgumentException si le token est invalide ou expiré
     */
    override fun verifyIdToken(idToken: String): FirebaseToken {
        val cleanToken = idToken.trim()

        if (cleanToken.isBlank()) {
            throw IllegalArgumentException("L'idToken Firebase ne peut pas être vide")
        }

        return try {
            val decoded = FirebaseAuth.getInstance().verifyIdToken(cleanToken)

            // getFirebase() retourne l'objet Firebase inner class du SDK (pas .firebase !)
            val provider = extractProviderFromToken(decoded)
            log.debug("Token Firebase valide — UID: ${decoded.uid}, provider: $provider")

            decoded

        } catch (e: FirebaseAuthException) {
            // Codes courants : EXPIRED_ID_TOKEN, INVALID_SIGNATURE, CERTIFICATE_FETCH_FAILED
            log.warn("Token Firebase rejeté [${e.authErrorCode}]: ${e.message}")
            throw IllegalArgumentException("Token Firebase invalide: ${e.authErrorCode?.name ?: e.message}")

        } catch (e: Exception) {
            log.error("Erreur inattendue lors de la vérification Firebase: ${e.message}")
            throw IllegalArgumentException("Erreur de vérification du token: ${e.message}")
        }
    }

    /**
     * Extrait le sign-in provider depuis le token Firebase.
     *
     * Deux approches selon la version du SDK :
     *  1. token.getFirebase().signInProvider  (méthode Java explicite, SDK >= 8.x)
     *  2. Lecture directe du claim "firebase" dans la map des claims du JWT
     *
     * Valeurs possibles :
     *   "google.com"   -> Google
     *   "github.com"   -> GitHub
     *   "facebook.com" -> Facebook
     *   "password"     -> email/password classique
     */
    override fun extractProvider(token: FirebaseToken): String {
        return extractProviderFromToken(token)
    }

    /**
     * Vérifie que l'email est présent.
     * GitHub peut ne pas le fournir si l'utilisateur l'a rendu privé.
     */
    override fun extractEmail(token: FirebaseToken): String {
        return token.email
            ?: throw IllegalArgumentException(
                "Aucun email associé à ce compte. " +
                        "Pour GitHub : assure-toi d'avoir un email public ou vérifié dans tes paramètres GitHub."
            )
    }

    // -------------------------------------------------------------------------
    //  Méthode privée : extraction du provider avec fallback robuste
    // -------------------------------------------------------------------------

    private fun extractProviderFromToken(token: FirebaseToken): String {

        // Approche 1 : appel Java explicite getFirebase()
        // Fonctionne avec Firebase Admin SDK 9.x
        // IMPORTANT : en Kotlin, .firebase ne compile pas sur FirebaseToken
        // car getFirebase() n'est pas une propriété Kotlin standard.
        return try {
            val firebaseClaim = token.claims["firebase"] as? Map<String, Any>
            firebaseClaim?.get("sign_in_provider") as? String ?: "unknown"
        } catch (e: Exception) {
            // Approche 2 (fallback) : lire le claim "firebase" du JWT directement
            fallbackProvider(token)
        }
    }

    /**
     * Fallback : lit le claim "firebase" directement depuis la map des claims du token.
     * Le JWT Firebase contient toujours un claim "firebase" avec cette structure :
     *   { "sign_in_provider": "google.com", "identities": { ... } }
     */
    @Suppress("UNCHECKED_CAST")
    private fun fallbackProvider(token: FirebaseToken): String {
        return try {
            val firebaseClaim = token.claims["firebase"] as? Map<String, Any>
            firebaseClaim?.get("sign_in_provider") as? String ?: "unknown"
        } catch (e: Exception) {
            log.warn("Impossible d'extraire le provider du token: ${e.message}")
            "unknown"
        }
    }

}
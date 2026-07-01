package com.example.manage_users.utils

import java.util.*

// ─────────────────────────────────────────────────────────────────────────────
//  UserIdGenerator
//  Génère un identifiant unique au format : USERS_<UUID-sans-tirets-majuscules>
//  Exemple : USERS_A3F2C1D4E5B6A7C8D9E0F1A2B3C4D5E6
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  UserIdGenerator
//  Génère des identifiants métier au format :
//    USERS-{ROLE}_{UUID_COURT}
//
//  Exemples :
//    USERS-SUPER_ADMIN_a3f9b2c1
//    USERS-D_GENERALE_7e4d1a8f
//    USERS-AG_COLLECTE_2b6c9e3d
//
//  L'UUID court = les 8 premiers caractères de l'UUID v4 (32 bits d'entropie).
//  Suffisant pour l'unicité à l'échelle d'une plantation, mais si tu veux
//  l'UUID complet, change shortUUID() par UUID.randomUUID().toString().
// ─────────────────────────────────────────────────────────────────────────────
object UsersIdGenerator {

    /**
     * Génère un ID au format USERS-{ROLE}_{UUID_COURT}
     * Exemple : USERS-AG_TERRAIN_4f8a2e1b
     */
    fun generate(role: UserRole): String {
        val shortUuid = UUID
            .randomUUID()
            .toString()
            .replace("-", "")
            .take(8)
            .uppercase()
        return "${role.name}_$shortUuid"
    }

    /**
     * Extrait le rôle depuis un ID généré.
     * Exemple : "USERS-AG_TERRAIN_4f8a2e1b" → "AG_TERRAIN"
     */
    fun extractRole(userId: String): String? {
        return runCatching {
            userId.removePrefix("USERS-").substringBeforeLast("_")
        }.getOrNull()
    }

    /**
     * Vérifie si un ID respecte le format attendu.
     */
    fun isValid(userId: String): Boolean {
        val regex = Regex("^USERS-[A-Z_]+_[a-f0-9]{8}$")
        return regex.matches(userId)
    }

}

// Note pour AuthController :
// JwtProvider.getUserIdFromToken() retourne un Long (ancien système).
// Avec le nouvel id String, récupérer l'utilisateur via son email est
// plus fiable : jwtProvider.getEmailFromToken(token) puis findByEmail().
// Le claim "userId" dans le JWT peut être mis à jour pour stocker le String
// dans generateTokenWithClaims() si vous souhaitez éviter la jointure par email.



object EntityIdGenerator {

    fun forFarm()     = generate("FARM")
    fun forPlot()     = generate("PLOT")
    fun forStock()    = generate("STOCK")
    fun forActivity() = generate("ACTIVITY")

    private fun generate(prefix: String): String {
        val uuid = UUID.randomUUID()
            .toString()
            .replace("-", "")
            .take(8)
            .uppercase()
        return "${prefix}_$uuid"
    }
}

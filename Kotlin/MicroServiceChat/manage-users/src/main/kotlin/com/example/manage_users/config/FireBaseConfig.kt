package com.example.manage_users.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.Resource

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FirebaseConfig
 *  Initialise le SDK Firebase Admin au démarrage de l'application.
 *
 *  Prérequis :
 *   - Télécharge la clé de service depuis :
 *     Firebase Console → Project Settings → Service accounts → Generate new private key
 *   - Place le fichier JSON dans : src/main/resources/firebase-service-account.json
 *   - AJOUTE firebase-service-account.json à ton .gitignore IMMÉDIATEMENT !
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Configuration
class FireBaseConfig {

    private val log = LoggerFactory.getLogger(FireBaseConfig::class.java)

    // Injecte le fichier service-account depuis resources/ via classpath:
    @Value("\${app.firebase.service-account-path}")
    private lateinit var serviceAccountResource: Resource

    @Value("\${app.firebase.project-id}")
    private lateinit var projectId: String

    @PostConstruct
    fun initializeFirebase() {
        // Évite la double initialisation (utile lors des tests ou hot-reload)
        if (FirebaseApp.getApps().isNotEmpty()) {
            log.info("Firebase déjà initialisé, skip.")
            return
        }

        try {
            // Charge les credentials depuis le fichier service account JSON
            val credentials = GoogleCredentials.fromStream(
                serviceAccountResource.inputStream
            )

            val options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .setProjectId(projectId)
                .build()

            FirebaseApp.initializeApp(options)
            log.info("✅ Firebase Admin SDK initialisé pour le projet : $projectId")

        } catch (e: Exception) {
            // L'appli démarre quand même mais l'auth sociale sera désactivée
            log.error("❌ Impossible d'initialiser Firebase : ${e.message}")
            log.error("Vérifie que src/main/resources/firebase-service-account.json existe.")
        }
    }
}

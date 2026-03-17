package com.example.manage_users.controller

import com.example.manage_users.dto.AgriUserDto
import com.example.manage_users.dto.MigrationReport
import com.example.manage_users.dto.MigrationResultat
import com.example.manage_users.service.interf.MigrationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin/migration")
class MigrationController (
    private val migrationService: MigrationService
) {

    /**
     * POST /api/admin/migration/run
     * Lance la migration en masse de tous les users Agriculture → Chat
     */
    @PostMapping("/run")
    fun lancerMigration(): ResponseEntity<MigrationReport> {
        val rapport = migrationService.migrerTousLesUsers()
        return ResponseEntity.ok(rapport)
    }

    /**
     * POST /api/admin/migration/single
     * Migre un seul user à partir de ses données Agriculture
     *
     * Body : le JSON complet d'un user Agriculture
     */
    @PostMapping("/single")
    fun migrerUnSeulUser(
        @RequestBody agriUser: AgriUserDto
    ): ResponseEntity<Map<String, String>> {

        val resultat = migrationService.migrerUnUser(agriUser)

        val message = when (resultat) {
            MigrationResultat.CREE   -> "✅ User '${agriUser.userCode}' migré avec succès"
            MigrationResultat.IGNORE -> "⏭️  User '${agriUser.userCode}' déjà migré, ignoré"
        }

        return ResponseEntity.ok(mapOf(
            "resultat" to resultat.name,
            "userCode" to agriUser.userCode,
            "message"  to message
        ))
    }

}
package com.example.manage_users.models

import com.example.manage_users.utils.EntityIdGenerator
import com.example.manage_users.utils.FarmStatus
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.PrePersist
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
import java.util.UUID

// ─────────────────────────────────────────────────────────────────────────────
//  Farm — Exploitation agricole
//
//  Unité principale du système. Regroupe plusieurs parcelles (Plot).
//  managerId référence un Users.id (String USERS_UUID) du service
//  manage_users — pas de FK JPA cross-module pour garder le découplage.
// ─────────────────────────────────────────────────────────────────────────────

@Entity
@Table(name = "farms")
data class Farm(

    @Id
    @Column(columnDefinition = "varchar(37)",updatable = false, nullable = false)
    var id: String = "",

    @Column(nullable = false, length = 150)
    var name: String,

    @Column(length = 255)
    var location: String? = null,

    @Column(length = 100)
    var city: String? = null,

    /** Surface totale en hectares */
    @Column(name = "surface_total")
    var surfaceTotal: Float? = null,

    @Column(name = "culture_type", length = 100)
    var cultureType: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: FarmStatus = FarmStatus.ACTIVE,

    /** Référence vers Users.id au format USERS_UUID */
    @Column(name = "manager_id", length = 38)
    var managerId: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @OneToMany(mappedBy = "farm", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val plots: MutableList<Plot> = mutableListOf()
) {
    /**
     * Appelé automatiquement par JPA avant chaque INSERT.
     * Génère l'id FARM_UUID si non déjà défini (permet aussi de le fixer dans les tests).
     */
    @PrePersist
    fun assignId() {
        if (id.isBlank()) id = EntityIdGenerator.forFarm()
    }
}
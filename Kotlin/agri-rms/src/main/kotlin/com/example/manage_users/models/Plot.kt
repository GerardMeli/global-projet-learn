package com.example.manage_users.models

import com.example.manage_users.utils.EntityIdGenerator
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.PrePersist
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
import java.util.UUID

// ─────────────────────────────────────────────────────────────────────────────
//  Plot — Parcelle agricole
//
//  Subdivision d'une exploitation. C'est l'unité sur laquelle sont
//  enregistrées toutes les activités (semis, traitements, récoltes).
//  geoJson stocke les coordonnées polygonales pour l'affichage carte.
//  lastActivity est dénormalisé pour éviter une requête d'agrégation
//  à chaque affichage de liste.
// ─────────────────────────────────────────────────────────────────────────────

@Entity
@Table(name = "plots")
data class Plot (

    @Id
    @Column(columnDefinition = "varchar(37)", updatable = false, nullable = false)
    var id: String = "",

    @Column(nullable = false, length = 150)
    var name: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    var farm: Farm,

    @Column(length = 100)
    var culture: String? = null,

    /** Surface en hectares */
    @Column
    var surface: Float? = null,

    /** GeoJSON (polygone) pour cartographie — stocké en TEXT */
    @Column(name = "geo_json", columnDefinition = "TEXT")
    var geoJson: String? = null,

    /** Dernière activité — mis à jour automatiquement par ActivityService */
    @Column(name = "last_activity")
    var lastActivity: LocalDateTime? = null,

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @OneToMany(mappedBy = "plot", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val activities: MutableList<Activity> = mutableListOf()
) {
    @PrePersist
    fun assignId() {
        if (id.isBlank()) id = EntityIdGenerator.forPlot()
    }
}
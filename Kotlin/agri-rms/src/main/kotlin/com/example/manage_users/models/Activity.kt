package com.example.manage_users.models

import com.example.manage_users.utils.ActivityStatus
import com.example.manage_users.utils.ActivityType
import com.example.manage_users.utils.EntityIdGenerator
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.PrePersist
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
import java.util.UUID

// ─────────────────────────────────────────────────────────────────────────────
//  Activity — Opération agricole sur une parcelle
//
//  Enregistre chaque intervention terrain. Lie une parcelle, un opérateur
//  (Users.id String) et optionnellement un intrant Stock avec sa quantité.
//  À la création d'une Activity :
//    1. Plot.lastActivity est mis à jour
//    2. Stock.quantity est décrémenté de `quantity` (si input != null)
// ─────────────────────────────────────────────────────────────────────────────

@Entity
@Table(name = "activities")
data class Activity (

    @Id
    @Column(columnDefinition = "varchar(37)", updatable = false, nullable = false)
    var id: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plot_id", nullable = false)
    var plot: Plot,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var type: ActivityType,

    /** Intrant utilisé — null pour HARVEST ou OTHER sans consommation */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "input_id")
    var input: Stock? = null,

    /** Quantité d'intrant consommée */
    @Column
    var quantity: Float? = null,

    /** Référence vers Users.id (USERS_UUID) — pas de FK cross-module */
    @Column(name = "operator_id", length = 38)
    var operatorId: String? = null,

    @Column(nullable = false)
    var date: LocalDateTime = LocalDateTime.now(),

    @Column(columnDefinition = "TEXT")
    var notes: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: ActivityStatus = ActivityStatus.PENDING,

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
){
    @PrePersist
    fun assignId() {
        if (id.isBlank()) id = EntityIdGenerator.forActivity()
    }
}

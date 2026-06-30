package com.example.manage_users.models

import com.example.manage_users.utils.EntityIdGenerator
import com.example.manage_users.utils.StockType
import com.example.manage_users.utils.StockUnit
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.PrePersist
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime
import java.util.UUID

// ─────────────────────────────────────────────────────────────────────────────
//  Stock — Inventaire des intrants agricoles
//
//  Centralise engrais, produits phyto et semences.
//  Quand quantity <= threshold (et threshold > 0), le stock est
//  considéré critique → alerte à remonter au manager.
//  La quantité est décrémentée automatiquement à chaque Activity
//  qui référence ce stock.
// ─────────────────────────────────────────────────────────────────────────────

@Entity
@Table(name = "stocks")
data class Stock(

    @Id
    @Column(columnDefinition = "varchar(37)", updatable = false, nullable = false)
    var id: String = "",

    @Column(nullable = false, length = 150)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var type: StockType,

    @Column(nullable = false)
    var quantity: Float = 0f,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    var unit: StockUnit,

    /** Seuil d'alerte. 10 = pas d'alerte. */
    @Column(nullable = false)
    var threshold: Float = 10f,

    /** Nom ou code du dépôt de stockage */
    @Column(length = 100)
    var warehouse: String? = null,

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
{
    @PrePersist
    fun assignId() {
        if (id.isBlank()) id = EntityIdGenerator.forStock()
    }
}
package com.example.manage_users.utils

enum class UserRole {
    USER,
    SUPER_ADMIN,
    D_GENERALE,
    D_PLANTATION,
    RESPO_STOCK,
    AG_TERRAIN,
    AG_COLLECTE
}

enum class FarmStatus    {
    ACTIVE,
    MAINTENANCE,
    INACTIVE
}

enum class ActivityType {
    PLANTING,      // Semis → utilise des semences (stock)
    FERTILIZING,   // Fertilisation → utilise des engrais (stock)
    TREATMENT,     // Traitement → utilise des produits phytos (stock)
    HARVEST,       // Récolte → ne consomme pas de stock
    OTHER          // Autre → ne consomme pas de stock
}

enum class ActivityStatus{
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}

enum class StockType     {
    FERTILIZER,
    PHYTO,
    SEED
}

enum class StockUnit     {
    KG,
    L
}

enum class UserStatus {
    PENDING_VERIFICATION,
    ACTIVE,
    SUSPENDED,
    BLOCKED,
    DELETED,
    PENDING
}

enum class Language {
    FR,  // Français
    EN,  // Anglais
    ES,  // Espagnol
    DE,  // Allemand
    IT   // Italien
}

enum class Permission {
    TOTAL,
    DECISIONNEL,
    GESTION_SITE,
    OPERATIONEL,
    LOGISTIQUE,
    COLLECTE,
    AUCUNE
}

enum class AlertSeverity {
    INFO, WARNING, CRITICAL
}

enum class StockOperation {
    ADD, REMOVE
}
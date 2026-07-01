package com.example.manage_users.service.interf

import com.example.manage_users.dto.StatsDto

interface StatsServiceInterface {


    /**
     * Retourne l'ensemble des statistiques pour le dashboard :
     *  - Totaux globaux (users actifs / inactifs)
     *  - Répartition par rôle
     *  - Répartition par statut avec pourcentages
     *  - Évolution des inscriptions sur 12 mois et 4 semaines
     */
    fun getGlobalStats(): StatsDto.GlobalStatsResponse

}
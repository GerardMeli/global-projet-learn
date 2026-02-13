package com.example.webScraping.model

import jakarta.persistence.*

@Entity
data class StateStats(

    @Id
    @Column(name = "ID")
    var id: Long,

    @Column(name = "NAME")
    var name: String ,

    @Column(name = "ACTIVE_CASE_COUNT")
    var activeCasesCount: Long ,

    @Column(name = "RESOLVED_CASE_COUNT")
    var resolvedCasesCount: Long ,

    @Column(name = "DEATH_CASE_COUNT")
    var deathCasesCount: Long ,

    @Column(name = "TOTAL_CASES_COUNT")
    var totalCasesCount: Long

)

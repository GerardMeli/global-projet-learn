package com.example.webScraping.repository

import com.example.webScraping.model.StateStats
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface StatesRepository: JpaRepository<StateStats, Long> {

    @Query("select s from StateStats s")
    fun getAllStates(): MutableList<StateStats?>

}
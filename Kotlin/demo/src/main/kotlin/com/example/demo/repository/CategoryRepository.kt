package com.example.demo.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import com.example.demo.model.Category

@Repository
interface CategoryRepository : JpaRepository<Category, Long> {
    fun findByName(name : String) : Category?
} 
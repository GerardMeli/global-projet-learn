package com.example.recipeapi.repository

import com.example.recipeapi.model.Recipe
import org.springframework.data.jpa.repository.JpaRepository

interface RecipesRepository: JpaRepository<Recipe, Long> {
    fun findByCuisineContainingIgnoreCase(cuisine: String): MutableList<Recipe>
    fun findByIngredientsContainingIgnoreCase(ingredient: String): MutableList<Recipe>
    fun findByTitleContainingIgnoreCase(title: String): MutableList<Recipe>
}
package com.example.recipeapi.controller

import com.example.recipeapi.model.Recipe
import com.example.recipeapi.repository.RecipesRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/recipes")
class RecipeController(
    private val recipeRepository: RecipesRepository
) {

    @GetMapping
    fun getRecipes(
        @RequestParam(value = "pageNumber", defaultValue = "0")
        pageNumber: Int,

        @RequestParam(value = "pageSize", defaultValue = "10")
        pageSize: Int
    ): ResponseEntity<Page<Recipe>> {

        val pageable = PageRequest.of(pageNumber, pageSize)
        return ResponseEntity.ok(recipeRepository.findAll(pageable))
    }

    @GetMapping("/filter")
    fun getFilteredRecipes(
        @RequestParam(value = "cuisine", required = false)
        cuisine: String?,

        @RequestParam(value = "title", required = false)
        title: String?,

        @RequestParam(value = "ingredients", required = false)
        ingredients: String?,

        @RequestParam(value = "maxCookingTime", required = false)
        maxCookingTime: Int?
    ): ResponseEntity<List<Recipe>> {

        var recipes = recipeRepository.findAll()

        if (!cuisine.isNullOrBlank()) {
            recipes = recipes.filter {
                it.cuisine.equals(cuisine, ignoreCase = true)
            }
        }

        if (!title.isNullOrBlank()) {
            recipes = recipes.filter {
                it.title.contains(title, ignoreCase = true)
            }
        }

        if (!ingredients.isNullOrBlank()) {
            recipes = recipes.filter {
                it.ingredients.contains(ingredients, ignoreCase = true)
            }
        }

        if (maxCookingTime != null && maxCookingTime != 0) {
            recipes = recipes.filter {
                it.cookingTime <= maxCookingTime
            }
        }

        return ResponseEntity.ok(recipes)
    }
}

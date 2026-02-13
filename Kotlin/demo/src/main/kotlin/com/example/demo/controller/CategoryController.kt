package com.example.demo.controller

import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus
import com.example.demo.service.CategoryService
import com.example.demo.model.Category
import com.example.demo.dto.CategoryDto
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.beans.factory.annotation.Autowired


@RestController
@RequestMapping("/api/categories")
class CategoryController @Autowired constructor(
    private val categoryService: CategoryService
) {

    @GetMapping("/all/categories")
    fun getAllCategories(): ResponseEntity<List<CategoryDto>> =
        ResponseEntity.ok(categoryService.getAllCategories())

    @GetMapping("/{id}")
    fun getCategoryById(@PathVariable id: Long): ResponseEntity<CategoryDto> =
        ResponseEntity.ok(categoryService.getCategoryById(id))

    @PostMapping("/add/category")
    fun createCategory(@RequestBody dto: CategoryDto): ResponseEntity<CategoryDto> {
        val created = categoryService.createCategory(dto)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @PutMapping("/{id}")
    fun updateCategory(
        @PathVariable id: Long,
        @RequestBody dto: CategoryDto
    ): ResponseEntity<CategoryDto> =
        ResponseEntity.ok(categoryService.updateCategory(id, dto))

    @DeleteMapping("/{id}")
    fun deleteCategory(@PathVariable id: Long): ResponseEntity<Void> {
        categoryService.deleteCategory(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/name/{name}")
    fun getCategoryByName(@PathVariable name: String): ResponseEntity<CategoryDto?> =
        ResponseEntity.ok(categoryService.findByName(name))
}
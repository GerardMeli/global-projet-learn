package com.example.demo.service


import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.beans.factory.annotation.Autowired
import com.example.demo.model.Category
import com.example.demo.repository.CategoryRepository
import com.example.demo.dto.CategoryDto  
import com.example.demo.mapper.CategoryMapper

@Service
@Transactional
class CategoryService @Autowired constructor(
    private val categoryRepository: CategoryRepository
) {

    fun createCategory(dto: CategoryDto): CategoryDto {
        val saved = categoryRepository.save(CategoryMapper.toEntity(dto))
        return CategoryMapper.toDto(saved)
    }

    fun getAllCategories(): List<CategoryDto> =
        categoryRepository.findAll().map { CategoryMapper.toDto(it) }

    fun getCategoryById(id: Long): CategoryDto =
        categoryRepository.findById(id)
            .orElseThrow { NoSuchElementException("Category not found") }
            .let { CategoryMapper.toDto(it) }

    fun updateCategory(id: Long, dto: CategoryDto): CategoryDto {
        val existing = categoryRepository.findById(id)
            .orElseThrow { NoSuchElementException("Category not found") }

        existing.name = dto.name
        existing.description = dto.description

        return CategoryMapper.toDto(categoryRepository.save(existing))
    }

    fun deleteCategory(id: Long) {
        if (!categoryRepository.existsById(id)) {
            throw NoSuchElementException("Category not found")
        }
        categoryRepository.deleteById(id)
    }

    fun findByName(name: String): CategoryDto? =
        categoryRepository.findByName(name)?.let { CategoryMapper.toDto(it) }
}
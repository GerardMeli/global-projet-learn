package com.example.demo.mapper

import com.example.demo.dto.CategoryDto
import com.example.demo.model.Category

object CategoryMapper {

    fun toDto(category: Category): CategoryDto =
        CategoryDto(
            id = category.id,
            name = category.name,
            description = category.description,
            productIds = category.products.map { it.id }
        )

    fun toEntity(dto: CategoryDto): Category =
        Category(
            id = dto.id ?: 0,
            name = dto.name,
            description = dto.description
        )
}
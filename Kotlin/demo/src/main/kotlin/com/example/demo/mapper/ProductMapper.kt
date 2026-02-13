package com.example.demo.mapper

import com.example.demo.dto.ProductDto
import com.example.demo.model.Product
import com.example.demo.model.Category

object ProductMapper {

    fun toDto(product: Product): ProductDto =
        ProductDto(
            id = product.id,
            name = product.name,
            description = product.description,
            price = product.price,
            stockQuantity = product.stockQuantity,
            imageUrl = product.imageUrl,
            categoryId = product.category.id
        )

    fun toEntity(dto: ProductDto, category: Category): Product =
        Product(
            name = dto.name,
            description = dto.description,
            price = dto.price,
            stockQuantity = dto.stockQuantity,
            imageUrl = dto.imageUrl,
            category = category
        )
}
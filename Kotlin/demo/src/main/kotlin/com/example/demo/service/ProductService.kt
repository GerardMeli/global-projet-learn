package com.example.demo.service

import com.example.demo.model.Product
import com.example.demo.repository.ProductRepository
import com.example.demo.repository.CategoryRepository
import com.example.demo.repository.OrderItemRepository
import com.example.demo.dto.ProductDto
import com.example.demo.mapper.ProductMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.beans.factory.annotation.Autowired

@Service
@Transactional
class ProductService @Autowired constructor(
    private val productRepository: ProductRepository,
    private val categoryRepository: CategoryRepository,
    private val orderItemRepository: OrderItemRepository
) {

    fun getAllProducts(): List<ProductDto> =
        productRepository.findAll().map { ProductMapper.toDto(it) }

    fun getProductById(id: Long): ProductDto =
        productRepository.findById(id)
            .orElseThrow { NoSuchElementException("Product with id $id not found") }
            .let { ProductMapper.toDto(it) }

    fun createProduct(dto: ProductDto): Product {
        val category = categoryRepository.findById(dto.categoryId)
            .orElseThrow { IllegalArgumentException("Category with id ${dto.categoryId} not found") }

        val product = Product(
            name = dto.name,
            description = dto.description,
            price = dto.price,
            stockQuantity = dto.stockQuantity,
            imageUrl = dto.imageUrl,
            category = category
        )

        return productRepository.save(product)
    }

    fun updateProduct(id: Long, dto: ProductDto): Product {
        val product = productRepository.findById(id)
            .orElseThrow { NoSuchElementException("Product with id $id not found") }

        // Update fields only if they are provided
        product.name = dto.name.takeIf { it.isNotEmpty() } ?: product.name
        product.description = dto.description.takeIf { it.isNotEmpty() } ?: product.description
        product.price = if (dto.price != 0.0) dto.price else product.price
        product.stockQuantity = if (dto.stockQuantity != 0) dto.stockQuantity else product.stockQuantity
        product.imageUrl = dto.imageUrl ?: product.imageUrl

        // Update category if a new ID is provided
        if (dto.categoryId != 0L && dto.categoryId != product.category.id) {
            val category = categoryRepository.findById(dto.categoryId)
                .orElseThrow { IllegalArgumentException("Category with id ${dto.categoryId} not found") }
            product.category = category
        }

        return productRepository.save(product)
    }

    fun deleteProduct(id: Long) {

        // Étape 1 : supprimer d'abord les références dans order_item
        orderItemRepository.deleteByProductId(id)

        // Étape 2 : supprimer le produit
        productRepository.deleteById(id)
    }


    fun searchByName(name: String): List<ProductDto> =
        productRepository.findByNameContainingIgnoreCase(name)
            .map { ProductMapper.toDto(it) }
}

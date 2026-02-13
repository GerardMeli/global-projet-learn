package com.example.demo.dto

data class ProductDto(
    var id: Long? = null,
    var name: String = "",
    var description: String = "",
    var price: Double = 0.0,
    var stockQuantity: Int = 0,
    var imageUrl: String? = null,
    var categoryId: Long = 0 // link by category ID
)

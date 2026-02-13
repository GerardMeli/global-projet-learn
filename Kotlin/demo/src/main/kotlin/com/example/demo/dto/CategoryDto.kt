package com.example.demo.dto


data class CategoryDto(
    var id: Long? = null,
    var name: String = "",
    var description: String = "",
    var productIds: List<Long> = emptyList() // only ids to avoid circular JSON
)

package com.example.demo.model

import jakarta.persistence.*
import lombok.NoArgsConstructor
import lombok.AllArgsConstructor
import lombok.Getter
import lombok.Setter

/**
 * Represents a category of products.
 */
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
data class Category(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    var name: String = "",
    var description: String = "",

    // One category can have many products
    @OneToMany(mappedBy = "category", cascade = [CascadeType.ALL])
    val products: List<Product> = listOf()
)
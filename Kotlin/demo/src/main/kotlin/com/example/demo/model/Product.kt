package com.example.demo.model

import jakarta.persistence.*
import lombok.AllArgsConstructor
import lombok.NoArgsConstructor
import lombok.Getter
import lombok.Setter

/**
 * Represents a product sold in the online store.
 */
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
data class Product(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    var name: String = "",
    var description: String = "",
    var price: Double = 0.0,
    var stockQuantity: Int = 0,
    var imageUrl: String? = null,

    // Many products belong to one category
    @ManyToOne
    @JoinColumn(name = "category_id")
    var category: Category = Category(), // default value!

    // // One product can appear in many order items
    @OneToMany(mappedBy = "product", cascade = [CascadeType.ALL])
    val orderItems: List<OrderItem> = listOf()
) 
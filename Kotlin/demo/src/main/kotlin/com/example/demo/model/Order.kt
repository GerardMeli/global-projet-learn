package com.example.demo.model

import java.time.LocalDateTime
import jakarta.persistence.*
import lombok.NoArgsConstructor
import lombok.AllArgsConstructor
import lombok.Setter
import lombok.Getter


/**
 * Represents an order placed by a user.
 */
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Table(name = "orders")
data class Order(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    var orderDate: LocalDateTime = LocalDateTime.now(),
    var status: String = "pending",
    var totalAmount: Double = 0.0,

    @ManyToOne
    @JoinColumn(name = "user_id")
    var user: User = User(),

    @OneToMany(mappedBy = "order", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var orderItems: MutableList<OrderItem> = mutableListOf()

)
 {
    constructor() : this(
        id = 0,
        orderDate = LocalDateTime.now(),
        status = "pending",
        totalAmount = 0.0,
        user = User(),
        orderItems = mutableListOf()
    )
}
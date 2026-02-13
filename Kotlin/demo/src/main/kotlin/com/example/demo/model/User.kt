package com.example.demo.model

import java.time.LocalDateTime
import jakarta.persistence.*
import lombok.AllArgsConstructor
import lombok.Getter
import lombok.NoArgsConstructor
import lombok.Setter

/**
 * Represents a user/customer of the online store.
 */
@Entity
@NoArgsConstructor
// @AllArgsConstructor
// @Setter
// @Getter
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    var firstname: String = "",
    var lastname: String = "",
    var email: String = "",
    var gender: String = "",
    var address: String = "",
    var phoneNumber: String = "",     // 👈 IMPORTANT !!
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @OneToMany(mappedBy = "user")
    var orders: List<Order> = emptyList()
)
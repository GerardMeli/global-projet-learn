package com.example.JunitDemo

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.SequenceGenerator
import jakarta.persistence.Table

@Entity
@Table(name = "books")
data class Book(

    @Id
    @SequenceGenerator(
        name = "book_seq",
        sequenceName = "book_seq",
        allocationSize = 1
    )
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "book_seq"
    )
    val id: Long,
    val title: String,
    val author: String,
    val price: Double
)

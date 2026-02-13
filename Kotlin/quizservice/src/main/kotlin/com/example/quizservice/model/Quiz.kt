package com.example.quizservice.model

import jakarta.persistence.*

@Entity
data class Quiz(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long,
    val title: String,

    @ElementCollection
    val questionIds: List<Int>?
) {

}

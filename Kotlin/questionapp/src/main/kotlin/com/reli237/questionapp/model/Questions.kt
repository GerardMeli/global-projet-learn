package com.reli237.questionapp.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id

@Entity // Marks this class as a JPA entity (maps to database table)
data class Questions(

    @Id // Marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-generates ID value
    val id: Int = 0,
    val questionTitle: String, // The question text
    val option1: String, // First multiple choice option
    val option2: String, // Second multiple choice option
    val option3: String, // Third multiple choice option
    val option4: String, // Fourth multiple choice option
    val rightAnswer: String, // Correct answer

    @Column(name = "difficultylevel") // Maps to database column with different name
    val difficultyLevel: String, // Difficulty level of the question
    val category: String // Category/topic of the question

)
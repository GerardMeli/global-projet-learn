package com.example.questionservice.model

// Data transfer object for quiz responses (not a JPA entity)
data class Response(
    val id: Int, // ID of the question being answered
    val response: String // User's selected answer
)
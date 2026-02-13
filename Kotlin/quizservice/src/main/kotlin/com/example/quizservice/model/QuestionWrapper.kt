package com.example.quizservice.model

// Data transfer object for exposing questions to users without the answer
data class QuestionWrapper(
    val id: Long = 0,
    val questionTitle: String,
    val option1: String,
    val option2: String,
    val option3: String,
    val option4: String,
    // Note: Does NOT include rightAnswer field to prevent cheating
)
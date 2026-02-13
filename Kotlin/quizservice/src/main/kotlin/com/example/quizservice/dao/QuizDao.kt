package com.example.quizservice.dao

import com.example.quizservice.model.Quiz
import org.springframework.data.jpa.repository.JpaRepository

// Repository interface for Quiz entity with basic CRUD operations
interface QuizDao : JpaRepository<Quiz, Long> {

}
package com.example.quizservice.controller

import com.example.quizservice.dto.QuizDto
import com.example.quizservice.model.QuestionWrapper
import com.example.quizservice.model.Response
import com.example.quizservice.service.QuizService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController // Marks this class as a REST controller
@RequestMapping("/quiz") // Base URL path for all endpoints
class QuizController(
    private val quizService: QuizService // Injects QuizService dependency
) {

    // POST endpoint to create a new quiz
    @PostMapping("create")
    fun createQuiz(
        @RequestBody quizDto: QuizDto
    ): ResponseEntity<String> {
        return quizService.createQuiz(quizDto.categoryName, quizDto.numQuestion, quizDto.title) // Delegates to service layer
    }

    // GET endpoint to retrieve questions for a specific quiz
    @GetMapping("/get/{id}")
    fun getQuizQuestions(@PathVariable id: Long): ResponseEntity<List<QuestionWrapper>> {
        return quizService.getQuizQuestion(id) // Delegates to service layer
    }

    // POST endpoint to submit quiz answers and calculate score
    @PostMapping("submit/{id}")
    fun submitQuiz(
        @PathVariable id: Int, // Path variable: quiz ID
        @RequestBody responses: List<Response> // Request body: user responses
    ): ResponseEntity<Int> {
        return quizService.calculateTheResult(id, responses) // Delegates to service layer
    }

}
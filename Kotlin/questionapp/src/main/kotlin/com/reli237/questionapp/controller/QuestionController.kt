package com.reli237.questionapp.controller

import com.reli237.questionapp.model.QuestionWrapper
import com.reli237.questionapp.model.Questions
import com.reli237.questionapp.model.Response
import com.reli237.questionapp.service.QuestionService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController // Marks this class as a REST controller that handles HTTP requests
@RequestMapping("/question") // Base URL path for all endpoints in this controller
class QuestionController(
    private val questionService: QuestionService // Injects QuestionService dependency
) {

    // GET endpoint to retrieve all questions
    @GetMapping("/allQuestions")
    fun getAllQuestions(): ResponseEntity<List<Questions>> {
        return questionService.getAllQuestion() // Delegates to service layer
    }

    // GET endpoint to retrieve questions by category
    @GetMapping("/category/{category}")
    fun getQuestionByCategory(@PathVariable category: String): ResponseEntity<List<Questions>> {
        return questionService.getAllQuestionByCategory(category) // Delegates to service layer
    }

    // POST endpoint to add a new question
    @PostMapping("/add")
    fun addQuestions(@RequestBody questions: Questions): ResponseEntity<String> {
        return questionService.addQuestion(questions) // Delegates to service layer
    }

    // DELETE endpoint to remove a question by ID
    @DeleteMapping("/delete")
    @ResponseStatus(HttpStatus.ACCEPTED) // Sets HTTP status to 202 Accepted on success
    fun deleteQuestion(@PathVariable id: Int) {
        questionService.deleteQuestion(id) // Delegates to service layer
    }

    @GetMapping("/generate")
    fun getQuestionsForQuiz(
        @RequestParam categoryName: String,
        @RequestParam numQuestion: Int
    ): ResponseEntity<List<Int>> {
        return questionService.getQuestionsForQuiz(categoryName, numQuestion)
    }
    
    @PostMapping("/getQuestions")
    fun getQuestionFromId(
        @RequestBody questionIds: List<Int>
    ): ResponseEntity<List<QuestionWrapper>> {
        return questionService.getQuestionsFromId(questionIds)
    }

    @PostMapping("/getScore")
    fun getScore(
        @RequestBody responses: List<Response>
    ): ResponseEntity<Int> {
        return questionService.getScore(responses)
    }

}
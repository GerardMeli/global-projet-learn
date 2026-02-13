package com.example.quizservice.service

import com.example.quizservice.dao.QuizDao
import com.example.quizservice.feign.QuizInterface
import com.example.quizservice.model.QuestionWrapper
import com.example.quizservice.model.Quiz
import com.example.quizservice.model.Response
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service

@Service // Marks this class as a Spring service component
class QuizService(
    private val quizInterfance: QuizInterface,
    private val quizDao: QuizDao// Injects QuizDao dependency
) {

    fun createQuiz(category: String, numQ: Int, title: String): ResponseEntity<String> {

        val questions: List<Int>? = quizInterfance.getQuestionsForQuiz(category, numQ).body
        val quiz = Quiz(
            id = 0,
            title = title,
            questionIds = questions
        )

        quizDao.save(quiz)

        return ResponseEntity("Success", HttpStatus.CREATED) // Returns 201 Created
    }

    // Retrieves questions for a quiz (wrapped without answers)
    fun getQuizQuestion(id: Long): ResponseEntity<List<QuestionWrapper>> {

        val quiz: Quiz = quizDao.findById(id).get() // Finds quiz by ID
        val questions: List<Int>? = quiz.questionIds
        val quest: ResponseEntity<List<QuestionWrapper>> = quizInterfance.getQuestionFromId(questions)

        return quest
    }

    // Calculates quiz score by comparing responses with correct answers
    fun calculateTheResult(id: Int, responses: List<Response>): ResponseEntity<Int> {

        val score: ResponseEntity<Int> = quizInterfance.getScore(responses)

        return score
    }

}
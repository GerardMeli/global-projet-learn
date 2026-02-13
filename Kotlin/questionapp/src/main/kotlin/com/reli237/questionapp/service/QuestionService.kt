package com.reli237.questionapp.service

import com.reli237.questionapp.dao.QuestionDao
import com.reli237.questionapp.model.QuestionWrapper
import com.reli237.questionapp.model.Questions
import com.reli237.questionapp.model.Response
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import java.util.ArrayList

@Service // Marks this class as a Spring service component
class QuestionService(
    private val questionDao: QuestionDao // Injects QuestionDao dependency
) {

    // Retrieves all questions from the database
    fun getAllQuestion(): ResponseEntity<List<Questions>> {
        try {
            return ResponseEntity(questionDao.findAll(), HttpStatus.OK) // Returns 200 OK with questions
        } catch (ex: Exception) {
            ex.stackTrace // Logs exception stack trace
        }
        return ResponseEntity(ArrayList(), HttpStatus.BAD_REQUEST) // Returns 400 on error
    }

    // Retrieves questions filtered by category
    fun getAllQuestionByCategory(category: String): ResponseEntity<List<Questions>> {
        try {
            return ResponseEntity(questionDao.findByCategory(category), HttpStatus.ACCEPTED) // Returns 202 Accepted
        } catch (ex: Exception) {
            ex.stackTrace // Logs exception stack trace
        }
        return ResponseEntity(ArrayList(), HttpStatus.BAD_REQUEST) // Returns 400 on error
    }

    // Adds a new question to the database
    fun addQuestion(questions: Questions): ResponseEntity<String> {
        questionDao.save(questions) // Saves the question entity
        return ResponseEntity("Success", HttpStatus.CREATED) // Returns 201 Created
    }

    // Deletes a question by ID
    fun deleteQuestion(id: Int) {
        questionDao.deleteById(id) // Deletes the question entity
    }

    fun getQuestionsForQuiz(categoryName: String, numQuestion: Int): ResponseEntity<List<Int>> {
        val questions: List<Int> = questionDao.findRandomQuestionByCategory(categoryName, numQuestion)
        return ResponseEntity(questions, HttpStatus.OK)
    }

    fun getQuestionsFromId(questionIds: List<Int>): ResponseEntity<List<QuestionWrapper>> {
        var wrappers: MutableList<QuestionWrapper> = ArrayList()
        var questions: MutableList<Questions> = ArrayList()
        
        for (id: Int in questionIds){
            questions.add(questionDao.findById(id).get())
        }

        for(question: Questions in questions){
            var questionWrapper: QuestionWrapper = QuestionWrapper(
                id = question.id,
                questionTitle = question.questionTitle,
                option1 = question.option1,
                option2 = question.option2,
                option3 = question.option3,
                option4 = question.option4
            )
            wrappers.add(questionWrapper)
        }
        return ResponseEntity(wrappers, HttpStatus.OK)
    }

    fun getScore(responses: List<Response>): ResponseEntity<Int> {

        var right: Int = 0 // Counter for correct answers

        // Compares each response with the correct answer
        for (res: Response in responses) {
            var quest: Questions = questionDao.findById(res.id).get()
            if (res.response.equals(quest.rightAnswer)) {
                right++ // Increments counter if answer is correct
            }
        }
        return ResponseEntity(right, HttpStatus.OK) // Returns 200 OK with score
    }


}
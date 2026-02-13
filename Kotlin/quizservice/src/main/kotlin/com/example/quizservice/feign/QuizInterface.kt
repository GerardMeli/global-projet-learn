package com.example.quizservice.feign

import com.example.quizservice.model.QuestionWrapper
import com.example.quizservice.model.Response
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam

@FeignClient("QUESTIONAPP")
interface QuizInterface {

    @GetMapping("question/generate")
    fun getQuestionsForQuiz(
        @RequestParam categoryName: String,
        @RequestParam numQuestion: Int
    ): ResponseEntity<List<Int>>

    @PostMapping("question/getQuestions")
    fun getQuestionFromId(
        @RequestBody questionIds: List<Int>?
    ): ResponseEntity<List<QuestionWrapper>>

    @PostMapping("question/getScore")
    fun getScore(
        @RequestBody responses: List<Response>
    ): ResponseEntity<Int>

}
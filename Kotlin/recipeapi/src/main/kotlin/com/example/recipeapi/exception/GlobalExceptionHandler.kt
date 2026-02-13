package com.example.recipeapi.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(Exception::class)
    fun handlerAllExceptions(ex: Exception): ResponseEntity<ApiErrorResponse> {
        val errorResponse = ApiErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), ex.message)
        return ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @ExceptionHandler(UsernameNotFoundException::class)
    fun handlerUserNotFoundException(ex: UsernameNotFoundException, request: WebRequest) : ResponseEntity<ApiErrorResponse> {
        val errorResponse = ApiErrorResponse(HttpStatus.NOT_FOUND.value(), ex.message)
        return ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
    }

}
package com.gateway.system_manager_file.exception

import com.gateway.system_manager_file.dto.ApiResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import java.net.MalformedURLException

@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(FileStorageException::class)
    fun handleFileStorageException(
        ex: FileStorageException
    ): ResponseEntity<ApiResponse> {
        return ResponseEntity
            .badRequest()
            .body(ApiResponse(success = false, message = ex.message ?: "File storage error"))
    }

    @ExceptionHandler(FileNotFoundException::class)
    fun handleFileNotFoundException(
        ex: FileNotFoundException
    ): ResponseEntity<ApiResponse> {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse(success = false, message = ex.message ?: "File not found"))
    }

    @ExceptionHandler(MalformedURLException::class)
    fun handleMalformedUrlException(
        ex: MalformedURLException
    ): ResponseEntity<ApiResponse> {
        return ResponseEntity
            .badRequest()
            .body(ApiResponse(success = false, message = "Invalid file URL"))
    }

    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception, model: Model): String {
        log.error("Unhandled exception", ex)
        model.addAttribute("errorMessage", ex.message ?: "Unknown error occurred")
        return "error" // your Thymeleaf error.html page
    }
}

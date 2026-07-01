package com.example.manage_users.execption

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.LocalDateTime

// ─────────────────────────────────────────────────────────────────────────────
//  GlobalExceptionHandler
//  Transforme toutes les exceptions métier en réponses JSON structurées.
// ─────────────────────────────────────────────────────────────────────────────

@RestControllerAdvice
class GlobalExceptionHandler {

    // ── Structure de réponse d'erreur ─────────────────────────────────────────

    data class ErrorResponse(
        val timestamp: LocalDateTime = LocalDateTime.now(),
        val status: Int,
        val error: String,
        val message: String,
        val details: Map<String, String>? = null
    )

    // ── 404 Not Found ─────────────────────────────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleNotFound(ex: ResourceNotFoundException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ErrorResponse(
                status = 404,
                error = "Not Found",
                message = ex.message ?: "Ressource introuvable."
            )
        )

    // ── 409 Conflict ──────────────────────────────────────────────────────────

    @ExceptionHandler(ResourceAlreadyExistsException::class)
    fun handleConflict(ex: ResourceAlreadyExistsException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.CONFLICT).body(
            ErrorResponse(
                status = 409,
                error = "Conflict",
                message = ex.message ?: "Ressource déjà existante."
            )
        )

    // ── 403 Forbidden (métier) ────────────────────────────────────────────────

    @ExceptionHandler(BusinessAccessDeniedException::class)
    fun handleAccessDeniedBusiness(ex: BusinessAccessDeniedException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            ErrorResponse(
                status = 403,
                error = "Forbidden",
                message = ex.message ?: "Accès refusé."
            )
        )

    // ── 400 Validation ────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val fieldErrors = ex.bindingResult.allErrors
            .filterIsInstance<FieldError>()
            .associate { it.field to (it.defaultMessage ?: "Valeur invalide") }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ErrorResponse(
                status = 400,
                error = "Bad Request",
                message = "Erreur de validation.",
                details = fieldErrors
            )
        )
    }

    // ── 500 Internal Server Error ─────────────────────────────────────────────

    @ExceptionHandler(Exception::class)
    fun handleGeneric(ex: Exception): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            ErrorResponse(
                status = 500,
                error = "Internal Server Error",
                message = "Une erreur interne est survenue. Veuillez réessayer."
            )
        )

}
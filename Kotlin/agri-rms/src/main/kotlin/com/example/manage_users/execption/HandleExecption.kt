package com.example.manage_users.execption

import org.springframework.http.HttpStatus
import org.springframework.security.core.AuthenticationException
import org.springframework.web.bind.annotation.ResponseStatus

// ─────────────────────────────────────────────────────────────────────────────
//  Exceptions métier personnalisées
//  À mapper dans un @RestControllerAdvice (GlobalExceptionHandler)
// ─────────────────────────────────────────────────────────────────────────────

/** 404 — Ressource introuvable */
@ResponseStatus(HttpStatus.NOT_FOUND)
class ResourceNotFoundException(message: String) : RuntimeException(message)

/** 409 — Ressource déjà existante (email en doublon, etc.) */
@ResponseStatus(HttpStatus.BAD_REQUEST)
class ResourceAlreadyExistsException(message: String) : RuntimeException(message)

/** 403 — Opération non autorisée pour le rôle courant */
class BusinessAccessDeniedException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.CONFLICT)
class InsufficientStockException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.FORBIDDEN)
class UnauthorizedOperationException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.CONFLICT)
class DuplicateResourceException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.BAD_REQUEST)
class ValidationException(message: String) : RuntimeException(message)

// JWT Exceptions
open class JwtAuthenticationException(message: String) : AuthenticationException(message)

class InvalidTokenException(message: String = "Invalid token") : JwtAuthenticationException(message)

class ExpiredTokenException(message: String = "Token expired") : JwtAuthenticationException(message)

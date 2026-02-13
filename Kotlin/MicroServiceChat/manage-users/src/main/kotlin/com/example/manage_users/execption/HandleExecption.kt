package com.example.manage_users.execption


import org.springframework.http.HttpStatus
import org.springframework.security.core.AuthenticationException
import org.springframework.web.bind.annotation.ResponseStatus

// Authentication Exceptions
class AccountNotVerifiedException(message: String = "Account not verified") : AuthenticationException(message)

class AccountSuspendedException(message: String = "Account suspended") : AuthenticationException(message)

class AccountBlockedException(message: String = "Account blocked") : AuthenticationException(message)

class AccountDeletedException(message: String = "Account deleted") : AuthenticationException(message)

class AccountInactiveException(message: String = "Account inactive") : AuthenticationException(message)

// JWT Exceptions
open class JwtAuthenticationException(message: String) : AuthenticationException(message)

class InvalidTokenException(message: String = "Invalid token") : JwtAuthenticationException(message)

class ExpiredTokenException(message: String = "Token expired") : JwtAuthenticationException(message)

// Business Exceptions
@ResponseStatus(HttpStatus.NOT_FOUND)
class ResourceNotFoundException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.CONFLICT)
class EmailAlreadyExistsException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.BAD_REQUEST)
class InvalidPasswordException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.BAD_REQUEST)
class BadRequestException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.UNAUTHORIZED)
class UnauthorizedException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.FORBIDDEN)
class ForbiddenException(message: String) : RuntimeException(message)

// Validation Exception
@ResponseStatus(HttpStatus.BAD_REQUEST)
class ValidationException(message: String, val errors: Map<String, String> = emptyMap()) : RuntimeException(message)

// Service Exceptions
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
class ServiceUnavailableException(message: String) : RuntimeException(message)

// Rate Limiting Exception
@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
class RateLimitExceededException(message: String = "Too many requests") : RuntimeException(message)

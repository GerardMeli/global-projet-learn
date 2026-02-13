package com.example.testsecurity.execption

// Custom Exceptions
class UserAlreadyExistsException(message: String) : RuntimeException(message)
class TokenGenerationException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)
class InvalidTokenException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)
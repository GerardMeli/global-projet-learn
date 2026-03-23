package com.reli237.web_application_chat.exception

import org.springframework.security.core.AuthenticationException

open class JwtAuthenticationException(message: String) : AuthenticationException(message)

class InvalidTokenException(message: String = "Invalid token") : JwtAuthenticationException(message)
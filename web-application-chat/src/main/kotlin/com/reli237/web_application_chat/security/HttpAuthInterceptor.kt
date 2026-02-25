package com.reli237.web_application_chat.security

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class HttpAuthInterceptor : HandlerInterceptor {

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {

        val authHeader = request.getHeader("Authorization")

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val token = authHeader.substring(7)
            val userId = validateTokenAndGetUserId(token)

            if (userId != null) {
                request.setAttribute("userId", userId)
            }
        }

        return true
    }

    private fun validateTokenAndGetUserId(token: String): Long? {
        return token.toLongOrNull()
    }
}

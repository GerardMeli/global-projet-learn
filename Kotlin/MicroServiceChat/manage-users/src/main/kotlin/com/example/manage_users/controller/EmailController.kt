package com.example.manage_users.controller

import com.example.manage_users.service.interf.AuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam

@Controller
@RequestMapping("/api/auth")
class EmailController(
    private val authService: AuthService
) {

    @GetMapping("/verify-email")
    fun verifyEmail(@Valid @RequestParam token: String): String {
        authService.verifyEmail(token)
        return "email/welcome"
    }


}
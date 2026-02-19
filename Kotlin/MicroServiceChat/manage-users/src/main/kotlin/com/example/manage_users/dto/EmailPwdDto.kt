package com.example.manage_users.dto

import jakarta.validation.constraints.*

class EmailPwdDto {

    data class ResendVerificationEmailRequest(
        @field:NotBlank
        @field:Email
        val email: String
    )

    // Password Reset
    data class ForgotPasswordRequest(
        @field:NotBlank
        @field:Email
        val email: String
    )

    data class ResetPasswordRequest(
        @field:NotBlank
        val token: String,

        @field:NotBlank
        @field:Size(min = 8, max = 100)
        val newPassword: String,

        @field:NotBlank
        val confirmPassword: String
    )

}
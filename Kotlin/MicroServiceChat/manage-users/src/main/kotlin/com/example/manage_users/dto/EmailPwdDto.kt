package com.example.manage_users.dto

import jakarta.validation.constraints.*

class EmailPwdDto {

    // Email Verification
    data class EmailVerificationRequest(
        @field:NotBlank
        val token: String
    )

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
        @field:Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$"
        )
        val newPassword: String,

        @field:NotBlank
        val confirmPassword: String
    )

}
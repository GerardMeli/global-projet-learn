package com.example.manage_users.service.interf

import com.example.manage_users.dto.EmailPwdDto
import com.example.manage_users.dto.RegistrationDto

interface AuthService {

    fun register(request: RegistrationDto.RegisterRequest): RegistrationDto.RegisterResponse
    fun login(request: RegistrationDto.LoginRequest): RegistrationDto.LoginResponse
    fun refreshToken(request: RegistrationDto.RefreshTokenRequest): RegistrationDto.TokenResponse
    fun verifyEmail(request: EmailPwdDto.EmailVerificationRequest)
    fun resendVerificationEmail(request: EmailPwdDto.ResendVerificationEmailRequest)
    fun forgotPassword(request: EmailPwdDto.ForgotPasswordRequest)
    fun resetPassword(request: EmailPwdDto.ResetPasswordRequest)
    fun logout(userId: Long)

}
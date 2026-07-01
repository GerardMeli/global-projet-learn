package com.example.manage_users.service.interf

import com.example.manage_users.dto.AuthDto

interface AuthService {

    fun logout(accessToken: String, refreshToken: String?): AuthDto.MessageResponse

    /** Authentifie l'utilisateur et retourne les tokens JWT. */
    fun login(request: AuthDto.LoginRequest): AuthDto.LoginResponse

    /** Rafraîchit l'access token à partir du refresh token. */
    fun refreshToken(request: AuthDto.RefreshTokenRequest): AuthDto.TokenRefreshResponse

    /** Déclenche l'envoi d'un email de réinitialisation de mot de passe. */
    fun forgotPassword(request: AuthDto.ForgotPasswordRequest): AuthDto.MessageResponse

    /** Réinitialise le mot de passe via le token reçu par email. */
    fun resetPassword(request: AuthDto.ResetPasswordRequest): AuthDto.MessageResponse

    /** Change le mot de passe de l'utilisateur connecté. */
    fun changePassword(userId: String, request: AuthDto.ChangePasswordRequest): AuthDto.MessageResponse

    /** Vérifie l'email via le token reçu par email. */
    fun verifyEmail(token: String): AuthDto.MessageResponse

    /** Renvoie un email de vérification. */
    fun resendVerificationEmail(email: String): AuthDto.MessageResponse

    /** Retourne les infos de l'utilisateur connecté. */
    fun me(userId: String): AuthDto.AuthUserInfo

    /**
     * Initialise le mot de passe d'un user créé par le super_admin.
     * Le token vient du lien reçu par email (tokenType = account_setup).
     */
    fun setupPassword(request: AuthDto.SetupPasswordRequest): AuthDto.MessageResponse
}
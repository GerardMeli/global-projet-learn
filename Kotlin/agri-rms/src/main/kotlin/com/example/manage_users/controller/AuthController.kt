package com.example.manage_users.controller

import com.example.manage_users.dto.AuthDto
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.AuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.view.RedirectView

// ─────────────────────────────────────────────────────────────────────────────
//  AuthController
//  Base URL : /api/auth
//
//  Endpoints publics (dans SecurityConfig → .permitAll()) :
//    POST   /api/auth/login
//    POST   /api/auth/refresh-token
//    POST   /api/auth/forgot-password
//    POST   /api/auth/reset-password          ← token dans le body
//    GET    /api/auth/verify-email?token=...  ← lien cliqué depuis l'email
//    POST   /api/auth/resend-verification
//
//  Endpoints protégés (token requis) :
//    POST   /api/auth/change-password
//    GET    /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val jwtProvider: JwtProvider
) {

    // ── POST /api/auth/login ──────────────────────────────────────────────────
    //  Authentifie l'utilisateur et retourne access + refresh tokens.
    //
    //  Body : { "email": "...", "password": "..." }
    //  Réponse 200 : { accessToken, refreshToken, tokenType, expiresIn, user }

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: AuthDto.LoginRequest
    ): ResponseEntity<AuthDto.LoginResponse> =
        ResponseEntity.ok(authService.login(request))

    // ── POST /api/auth/logout ─────────────────────────────────────────────────
    //  Révoque l'access token + le refresh token (optionnel).
    //  Après ce call, les deux tokens sont invalides côté serveur.
    //
    //  Header : Authorization: Bearer <accessToken>
    //  Body   : { "refreshToken": "..." }  ← optionnel mais recommandé

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    fun logout(
        @RequestHeader("Authorization") authHeader: String,
        @RequestBody(required = false) body: AuthDto.LogoutRequest?
    ): ResponseEntity<AuthDto.MessageResponse> {
        val accessToken = authHeader.removePrefix("Bearer ")
        return ResponseEntity.ok(
            authService.logout(accessToken, body?.refreshToken)
        )
    }

    // ── POST /api/auth/refresh-token ──────────────────────────────────────────
    //  Échange un refresh token valide contre un nouvel access token.
    //
    //  Body : { "refreshToken": "..." }
    //  Réponse 200 : { accessToken, refreshToken, tokenType, expiresIn }

    @PostMapping("/refresh-token")
    fun refreshToken(
        @Valid @RequestBody request: AuthDto.RefreshTokenRequest
    ): ResponseEntity<AuthDto.TokenRefreshResponse> =
        ResponseEntity.ok(authService.refreshToken(request))

    // ── POST /api/auth/forgot-password ────────────────────────────────────────
    //  Déclenche l'envoi d'un email avec un lien de réinitialisation.
    //  Retourne toujours 200 (ne révèle pas si l'email existe).
    //
    //  Body : { "email": "..." }

    @PostMapping("/forgot-password")
    fun forgotPassword(
        @Valid @RequestBody request: AuthDto.ForgotPasswordRequest
    ): ResponseEntity<AuthDto.MessageResponse> =
        ResponseEntity.ok(authService.forgotPassword(request))

    // ── POST /api/auth/reset-password ─────────────────────────────────────────
    //  Réinitialise le mot de passe via le token reçu par email.
    //  ⚠️  Cette route est exclue du JwtAuthenticationFilter (shouldNotFilter)
    //      car le token de reset ne doit pas être interprété comme un token d'accès.
    //
    //  Body : { "token": "...", "newPassword": "..." }

    @PostMapping("/reset-password")
    fun resetPassword(
        @Valid @RequestBody request: AuthDto.ResetPasswordRequest
    ): ResponseEntity<AuthDto.MessageResponse> =
        ResponseEntity.ok(authService.resetPassword(request))

    // ── GET /api/auth/verify-email?token=... ──────────────────────────────────
    //  Vérifie l'email via le lien cliqué dans l'email de vérification.
    //  Paramètre query string pour correspondre aux liens générés par EmailServiceImpl.
    //
    //  Exemple d'URL générée : $baseUrl/api/auth/verify-email?token=eyJ...

    @GetMapping("/verify-email")
    fun verifyEmail(
        @RequestParam token: String
    ): ResponseEntity<AuthDto.MessageResponse> =
        ResponseEntity.ok(authService.verifyEmail(token))

    // ── POST /api/auth/resend-verification ────────────────────────────────────
    //  Renvoie un email de vérification si l'email n'est pas encore vérifié.
    //  Retourne toujours 200 (ne révèle pas si l'email existe).
    //
    //  Body : { "email": "..." }

    @PostMapping("/resend-verification")
    fun resendVerification(
        @Valid @RequestBody request: AuthDto.ResendVerificationRequest
    ): ResponseEntity<AuthDto.MessageResponse> =
        ResponseEntity.ok(authService.resendVerificationEmail(request.email))

    // ── POST /api/auth/change-password ────────────────────────────────────────
    //  Change le mot de passe de l'utilisateur connecté.
    //  Nécessite un token d'accès valide dans le header Authorization.
    //
    //  Body : { "currentPassword": "...", "newPassword": "..." }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    fun changePassword(
        @Valid @RequestBody request: AuthDto.ChangePasswordRequest,
        @RequestHeader("Authorization") authHeader: String
    ): ResponseEntity<AuthDto.MessageResponse> {
        val token = authHeader.removePrefix("Bearer ")
        val userId = jwtProvider.getUserIdFromToken(token)
        return ResponseEntity.ok(authService.changePassword(userId, request))
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────────
    //  Retourne les informations de l'utilisateur connecté.
    //  Nécessite un token d'accès valide dans le header Authorization.

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    fun me(
        @RequestHeader("Authorization") authHeader: String
    ): ResponseEntity<AuthDto.AuthUserInfo> {
        val token = authHeader.removePrefix("Bearer ")
        val userId = jwtProvider.getUserIdFromToken(token)
        return ResponseEntity.ok(authService.me(userId))
    }

    // ── POST /api/auth/setup-password ─────────────────────────────────────────
    //  Permet à un user nouvellement créé par le super_admin de définir son mot
    //  de passe via le lien reçu par email (token de type "account_setup").
    //  ⚠️  Route publique — pas de JWT d'accès requis.
    //
    //  Body : { "token": "...", "newPassword": "...", "confirmPassword": "..." }

    @PostMapping("/setup-password")
    fun setupPassword(
        @Valid @RequestBody request: AuthDto.SetupPasswordRequest
    ): ResponseEntity<AuthDto.MessageResponse> =
        ResponseEntity.ok(authService.setupPassword(request))

    @GetMapping("/reset-password", produces = ["text/html"])
    fun resetPasswordPage(): RedirectView =
        RedirectView("/reset-password.html")

    // ── GET /setup-password?token=... ─────────────────────────────────────────
    //  Même logique que ci-dessus pour la page d'activation de compte.

    @GetMapping("/setup-password", produces = ["text/html"])
    fun setupPasswordPage(): RedirectView =
        RedirectView("/setup-password.html")
}

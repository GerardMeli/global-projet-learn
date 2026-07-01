package com.example.manage_users.controller

import com.example.manage_users.dto.EmailPwdDto
import com.example.manage_users.dto.RegistrationDto
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.impl.AuthServiceImpl
import com.example.manage_users.service.interf.AuthService
import com.example.manage_users.service.interf.EmailService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["*"], maxAge = 3600)
@Tag(name = "Authentification", description = "Endpoints pour l'inscription, la connexion et la gestion des accès")
class AuthController (
    private val authService: AuthService,
    private val jwtProvider: JwtProvider,
    private val authServiceImpl: AuthServiceImpl,
    private val usersRepository: UsersRepository,
    private val emailService: EmailService
) {

       private val logger = LoggerFactory.getLogger(AuthController::class.java)

    @Operation(summary = "Inscription", description = "Permet à un nouvel utilisateur de créer un compte.")
    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegistrationDto.RegisterRequest): ResponseEntity<RegistrationDto.RegisterResponse> {
        val response = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @Operation(summary = "Connexion", description = "Authentifie un utilisateur et retourne un token JWT ainsi qu'une session.")
    @PostMapping("/login")
    fun login(
        @RequestBody request: RegistrationDto.LoginRequest,
        httpSession: HttpSession
    ): ResponseEntity<ApiResponse<RegistrationDto.LoginResponse>> {
        return try {
            // Validate input
            if (request.email.isBlank() || request.password.isBlank()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse(
                        success = false,
                        message = "Email and password are required",
                        data = null
                    ))
            }

            // Authenticate user credentials
            val user = authServiceImpl.authenticateUser(request)

            // Generate JWT token with user claims
            val token = jwtProvider.generateTokenWithClaims(
                userId = user.id,
                email = user.email,
                role = user.role.toString()
            )

            // Generate session ID (Spring automatically creates it)
            val sessionId = httpSession.id

            // Store user info in session
            httpSession.setAttribute("userId", user.id)
            httpSession.setAttribute("email", user.email)
            httpSession.setAttribute("role", user.role.toString())
            httpSession.setAttribute("loginTime", System.currentTimeMillis())

            // Set session timeout (30 minutes)
            httpSession.maxInactiveInterval = 30 * 60

            // Calculate token expiration
            val expiresIn = jwtProvider.getTokenExpirationSeconds()

            val loginResponse = RegistrationDto.LoginResponse(
                user = user,
                token = token,
                tokenType = "Bearer",
                expiresIn = expiresIn,
                sessionId = sessionId  // Include sessionId in response
            )

            ResponseEntity.ok()
                .header("X-Session-Id", sessionId)  // Also send as header
                .body(ApiResponse(
                    success = true,
                    message = "Login successful",
                    data = loginResponse
                ))

        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest()
                .body(ApiResponse(
                    success = false,
                    message = e.message ?: "Invalid credentials",
                    data = null
                ))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse(
                    success = false,
                    message = e.message ?: "User account is inactive",
                    data = null
                ))
        } catch (e: Exception) {
             logger.error("Login error", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse(
                    success = false,
                    message = "An error occurred during login",
                    data = null
                ))
        }
    }

    @Operation(summary = "Rafraîchir le token", description = "Permet d'obtenir un nouveau token d'accès via un refresh token.")
    @PostMapping("/refresh-token")
    fun refreshToken(@Valid @RequestBody request: RegistrationDto.RefreshTokenRequest): ResponseEntity<RegistrationDto.TokenResponse> {
        val response = authService.refreshToken(request)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "Renvoyer l'email de vérification", description = "Envoie à nouveau l'email de validation de compte.")
    @PostMapping("/resend-verification")
    fun resendVerificationEmail(@Valid @RequestBody request: EmailPwdDto.ResendVerificationEmailRequest): ResponseEntity<Void> {
        authService.resendVerificationEmail(request)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "Mot de passe oublié", description = "Initie la procédure de récupération de mot de passe par email.")
    @PostMapping("/forgot-password")
    fun forgotPassword(@Valid @RequestBody request: EmailPwdDto.ForgotPasswordRequest): ResponseEntity<Void> {
        authService.forgotPassword(request)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "Réinitialiser le mot de passe", description = "Définit un nouveau mot de passe à l'aide d'un token de réinitialisation.")
    @PostMapping("/reset-password")
    fun resetPassword(
        @RequestBody request: EmailPwdDto.ResetPasswordRequest
    ): ResponseEntity<Any> {
        return try {
            // 1. Valide le token et met à jour le mot de passe en BDD
            authService.resetPassword(request)

            // 2. Envoie le welcome email (non-bloquant en cas d'erreur)
            try {
                val email = jwtProvider.getEmailFromToken(request.token)
                if (!email.isNullOrBlank()) {
                    usersRepository.findByEmail(email).ifPresent { user ->
                        emailService.sendWelcomeEmail(user)
                        logger.info("✅ Welcome email dispatched to: ${user.email}")
                    }
                }
            } catch (e: Exception) {
                // N'interrompt pas la réponse si l'email échoue
                logger.warn("⚠️ Could not dispatch welcome email after password set: ${e.message}")
            }

            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Mot de passe défini avec succès. Bienvenue sur FlowChat !"
            ))

        } catch (e: Exception) {
            logger.error("Reset password error", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf(
                "success" to false,
                "message" to (e.message ?: "Erreur lors de la réinitialisation du mot de passe")
            ))
        }
    }

    @Operation(summary = "Déconnexion", description = "Invalide la session de l'utilisateur.")
    @PostMapping("/logout")
    fun logout(@RequestParam userId: String): ResponseEntity<Void> {
        authService.logout(userId)
        return ResponseEntity.ok().build()
    }
}

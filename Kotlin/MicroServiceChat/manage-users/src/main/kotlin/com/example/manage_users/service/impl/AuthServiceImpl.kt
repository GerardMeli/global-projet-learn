package com.example.manage_users.service.impl

import com.example.manage_users.config.PasswordEncoderConfig
import com.example.manage_users.dto.EmailPwdDto
import com.example.manage_users.dto.RegistrationDto
import com.example.manage_users.execption.AccountBlockedException
import com.example.manage_users.execption.AccountDeletedException
import com.example.manage_users.execption.AccountInactiveException
import com.example.manage_users.execption.AccountNotVerifiedException
import com.example.manage_users.execption.AccountSuspendedException
import com.example.manage_users.execption.BadRequestException
import com.example.manage_users.execption.EmailAlreadyExistsException
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.mapper.UserMapper
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import com.example.manage_users.models.Users
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.AuthService
import com.example.manage_users.service.interf.EmailService
import com.example.manage_users.service.interf.TokenService
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class AuthServiceImpl(
    private val usersRepository: UsersRepository,
    private val passwordEncoder: PasswordEncoderConfig,
    private val userMapper: UserMapper,
    private val jwtProvider: JwtProvider,
    private val emailService: EmailService,
    private val tokenService: TokenService,
    private val loginAttemptService: LoginAttemptService
) : AuthService {

    private val log = LoggerFactory.getLogger(AuthServiceImpl::class.java)

    override fun register(request: RegistrationDto.RegisterRequest): RegistrationDto.RegisterResponse {
        if (usersRepository.existsByEmail(request.email)) {
            throw EmailAlreadyExistsException("Email already registered: ${request.email}")
        }

        val user = Users(
            id = 0,
            email = request.email,
            password = passwordEncoder.passwordEncoder().encode(request.password),
            firstName = request.firstName,
            lastName = request.lastName,
            phoneNumber = request.phoneNumber,
            address = request.address,
            role = UserRole.USER,
            status = UserStatus.PENDING,
            isActive = true,
            emailVerified = false,
            language = request.language,
            createdAt = LocalDateTime.now()
        )

        val savedUser = usersRepository.save(user)

        val token = tokenService.createEmailVerificationToken(savedUser.id)
        emailService.sendVerificationEmail(savedUser.email, token)

        return RegistrationDto.RegisterResponse(
            id = savedUser.id,
            email = savedUser.email,
            firstName = savedUser.firstName,
            lastName = savedUser.lastName,
            role = savedUser.role,
            status = savedUser.status
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUTHENTIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    fun authenticateUser(request: RegistrationDto.LoginRequest): RegistrationDto.UserResponse {

        val user = usersRepository.findByEmail(request.email)
            .orElseThrow { ResourceNotFoundException("Utilisateur introuvable : ${request.email}") }

        // 1. Vérifications du statut avant tout
        when (user.status) {
            UserStatus.BLOCKED              -> throw AccountBlockedException(
                "Compte bloqué après trop de tentatives échouées. Contactez le support.")
            UserStatus.SUSPENDED            -> throw AccountSuspendedException("Compte suspendu.")
            UserStatus.DELETED              -> throw AccountDeletedException("Compte supprimé.")
            UserStatus.PENDING,
            UserStatus.PENDING_VERIFICATION -> throw AccountNotVerifiedException(
                "Veuillez vérifier votre email avant de vous connecter.")
            UserStatus.INACTIVE             -> throw AccountInactiveException("Compte inactif.")
            else                            -> Unit
        }

        if (!user.isActive) throw AccountInactiveException("Compte inactif.")

        // 2. Vérification du mot de passe
// Dans authenticateUser — passer l'id directement
        if (!passwordEncoder.passwordEncoder().matches(request.password, user.password)) {
            loginAttemptService.handleFailedLogin(user.id)  // ← passer l'id, pas l'email
            throw BadCredentialsException("Mot de passe incorrect.")
        }

        // 3. Succès → réinitialise les tentatives échouées
        if (user.failedLoginAttempts > 0) {
            usersRepository.resetFailedLoginAttempts(user.id)
            log.debug("✅ Tentatives réinitialisées pour : ${user.email}")
        }

        log.info("✅ Connexion réussie : ${user.email}")
        return userMapper.mapToUserResponse(user)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REFRESH TOKEN
    // ─────────────────────────────────────────────────────────────────────────
    override fun refreshToken(request: RegistrationDto.RefreshTokenRequest): RegistrationDto.TokenResponse {
        val username = jwtProvider.getUsernameFromToken(request.refreshToken)
        val user = usersRepository.findByEmail(username.toString())
            .orElseThrow { ResourceNotFoundException("User not found") }

        val newAccessToken  = jwtProvider.generateAccessToken(username.toString())
        val newRefreshToken = jwtProvider.generateRefreshToken(username.toString())

        return RegistrationDto.TokenResponse(
            accessToken  = newAccessToken,
            refreshToken = newRefreshToken,
            expiresIn    = jwtProvider.getAccessTokenExpiration()
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VÉRIFICATION EMAIL
    // ─────────────────────────────────────────────────────────────────────────
    override fun verifyEmail(tokenValue: String) {
        val userId = tokenService.validateEmailVerificationToken(tokenValue)
        val user = usersRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        user.emailVerified = true
        user.status = UserStatus.ACTIVE
        usersRepository.save(user)

        tokenService.deleteEmailVerificationToken(tokenValue)
    }

    override fun resendVerificationEmail(request: EmailPwdDto.ResendVerificationEmailRequest) {
        val user = usersRepository.findByEmail(request.email)
            .orElseThrow { ResourceNotFoundException("User not found") }

        if (user.emailVerified) throw BadRequestException("Email already verified")

        val token = tokenService.createEmailVerificationToken(user.id)
        emailService.sendVerificationEmail(user.email, token)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RESET MOT DE PASSE
    // ─────────────────────────────────────────────────────────────────────────
    override fun forgotPassword(request: EmailPwdDto.ForgotPasswordRequest) {
        val user = usersRepository.findByEmail(request.email)
            .orElseThrow { ResourceNotFoundException("User not found") }

        val token = jwtProvider.createPasswordResetToken(user.id, user.email)
        log.debug("Generated password reset token with type: ${jwtProvider.getTokenTypeFromToken(token)}")
        emailService.sendPasswordResetEmailWithToken(user.email, token)
    }

    override fun resetPassword(request: EmailPwdDto.ResetPasswordRequest) {

        if (request.newPassword != request.confirmPassword) {
            throw BadRequestException("Les mots de passe ne correspondent pas")
        }

        val email = tokenService.validatePasswordResetToken(request.token)

        val user = usersRepository.findByEmail(email)
            .orElseThrow { ResourceNotFoundException("Utilisateur non trouvé") }

        user.password = passwordEncoder.passwordEncoder().encode(request.newPassword)
        usersRepository.save(user)

        tokenService.deletePasswordResetToken(request.token)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────────────────────────────────────
    override fun logout(userId: Long) {
        SecurityContextHolder.clearContext()
    }
}
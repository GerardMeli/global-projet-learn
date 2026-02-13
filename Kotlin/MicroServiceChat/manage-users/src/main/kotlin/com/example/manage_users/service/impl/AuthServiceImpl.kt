package com.example.manage_users.service.impl

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
import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import com.example.manage_users.models.Users
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.AuthService
import com.example.manage_users.service.interf.EmailService
import com.example.manage_users.service.interf.TokenService
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class AuthServiceImpl(
    private val usersRepository: UsersRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authenticationManager: AuthenticationManager,
    private val jwtProvider: JwtProvider,
    private val emailService: EmailService,
    private val tokenService: TokenService
) : AuthService {

    override fun register(request: RegistrationDto.RegisterRequest): RegistrationDto.RegisterResponse {
        if (usersRepository.existsByEmail(request.email)) {
            throw EmailAlreadyExistsException("Email already registered: ${request.email}")
        }

        val user = Users(
            id = 0,
            email = request.email,
            password = passwordEncoder.encode(request.password),
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

        // Generate verification token and send email
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

    override fun login(request: RegistrationDto.LoginRequest): RegistrationDto.LoginResponse {
        try {
            // Authentifier l'utilisateur
            val authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(request.email, request.password)
            )

            SecurityContextHolder.getContext().authentication = authentication

            // Récupérer l'utilisateur depuis la BDD
            val user = usersRepository.findByEmail(request.email)
                .orElseThrow { ResourceNotFoundException("User not found") }

            // Vérifier le statut du compte
            when (user.status) {
                UserStatus.PENDING -> throw AccountNotVerifiedException("Please verify your email first")
                UserStatus.SUSPENDED -> throw AccountSuspendedException("Account has been suspended")
                UserStatus.BLOCKED -> throw AccountBlockedException("Account has been blocked")
                UserStatus.DELETED -> throw AccountDeletedException("Account has been deleted")
                else -> {}
            }

            if (!user.isActive) {
                throw AccountInactiveException("Account is inactive")
            }

            // Réinitialiser les tentatives échouées lors d'une connexion réussie
            usersRepository.resetFailedLoginAttempts(user.id)

            // Générer les tokens JWT avec l'email de l'utilisateur
            val accessToken = jwtProvider.generateAccessToken(user.email)
            val refreshToken = jwtProvider.generateRefreshToken(user.email)

            return RegistrationDto.LoginResponse(
                id = user.id,
                email = user.email,
                firstName = user.firstName,
                lastName = user.lastName,
                role = user.role,
                accessToken = accessToken,
                refreshToken = refreshToken,
                tokenType = "Bearer",
                expiresIn = jwtProvider.getAccessTokenExpiration()
            )
        } catch (ex: BadCredentialsException) {
            handleFailedLogin(request.email)
            throw BadRequestException("Invalid email or password")
        }
    }

    private fun handleFailedLogin(email: String) {
        usersRepository.findByEmail(email).ifPresent { user ->
            usersRepository.incrementFailedLoginAttempts(user.id)

            // Lock account after 5 failed attempts
            if (user.failedLoginAttempts >= 4) { // Will be 5 after increment
                user.status = UserStatus.BLOCKED
                usersRepository.save(user)
            }
        }
    }

    override fun refreshToken(request: RegistrationDto.RefreshTokenRequest): RegistrationDto.TokenResponse {
        val username = jwtProvider.getUsernameFromToken(request.refreshToken)
        val user = usersRepository.findByEmail(username.toString())
            .orElseThrow { ResourceNotFoundException("User not found") }

        val newAccessToken = jwtProvider.generateAccessToken(username.toString())
        val newRefreshToken = jwtProvider.generateRefreshToken(username.toString())

        return RegistrationDto.TokenResponse(
            accessToken = newAccessToken,
            refreshToken = newRefreshToken,
            expiresIn = jwtProvider.getAccessTokenExpiration()
        )
    }

    override fun verifyEmail(request: EmailPwdDto.EmailVerificationRequest) {
        val tokenValue = request.token
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

        if (user.emailVerified) {
            throw BadRequestException("Email already verified")
        }

        val token = tokenService.createEmailVerificationToken(user.id)
        emailService.sendVerificationEmail(user.email, token)
    }

    override fun forgotPassword(request: EmailPwdDto.ForgotPasswordRequest) {
        val user = usersRepository.findByEmail(request.email)
            .orElseThrow { ResourceNotFoundException("User not found") }

        val token = tokenService.createPasswordResetToken(user.id)
        emailService.sendPasswordResetEmail(user.email, token)
    }

    override fun resetPassword(request: EmailPwdDto.ResetPasswordRequest) {
        if (request.newPassword != request.confirmPassword) {
            throw BadRequestException("Passwords do not match")
        }

        val tokenValue = request.token
        val userId = tokenService.validatePasswordResetToken(tokenValue)
        val user = usersRepository.findById(userId.toLong())
            .orElseThrow { ResourceNotFoundException("User not found") }

        user.password = passwordEncoder.encode(request.newPassword)
        usersRepository.save(user)

        tokenService.deletePasswordResetToken(tokenValue)
    }
    override fun logout(userId: Long) {
        SecurityContextHolder.clearContext()
        // Additional logout logic (blacklist token, etc.)
    }
}
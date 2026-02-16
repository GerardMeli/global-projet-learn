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
    private val passwordEncoder: PasswordEncoderConfig,
    private val userMapper: UserMapper,
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

    fun authenticateUser(request: RegistrationDto.LoginRequest): RegistrationDto.UserResponse {
        val user = usersRepository.findByEmail(request.email)
            .orElseThrow { throw IllegalArgumentException("User not found with email: ${request.email}") }

        if (!user.isActive) {
            throw IllegalStateException("User account is inactive")
        }

        if (!passwordEncoder.passwordEncoder().matches(request.password, user.password)) {
            throw IllegalArgumentException("Invalid password")
        }

        return userMapper.mapToUserResponse(user)
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

        user.password = passwordEncoder.passwordEncoder().encode(request.newPassword)
        usersRepository.save(user)

        tokenService.deletePasswordResetToken(tokenValue)
    }
    
    override fun logout(userId: Long) {
        SecurityContextHolder.clearContext()
        // Additional logout logic (blacklist token, etc.)
    }
}
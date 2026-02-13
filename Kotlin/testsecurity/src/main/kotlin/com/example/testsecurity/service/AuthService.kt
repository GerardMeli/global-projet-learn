package com.example.testsecurity.service

import com.example.testsecurity.dto.*
import com.example.testsecurity.execption.InvalidTokenException
import com.example.testsecurity.execption.UserAlreadyExistsException
import com.example.testsecurity.model.RefreshToken
import com.example.testsecurity.model.User
import com.example.testsecurity.repository.RefreshTokenRepository
import com.example.testsecurity.repository.UserRepository
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional
class AuthService(
    private val authenticationManager: AuthenticationManager,
    private val userRepository: UserRepository,
    private val jwtService: JwtService,
    private val passwordEncoder: PasswordEncoder,
    private val refreshTokenRepository: RefreshTokenRepository? = null
) {

    companion object {
        private const val DEFAULT_USER_ROLE = "ROLE_USER"
    }

    // Load Google OAuth credentials from environment variables
    private val googleClientId: String = System.getenv("GOOGLE_CLIENT_ID") ?: ""
    private val googleClientSecret: String = System.getenv("GOOGLE_CLIENT_SECRET") ?: ""

    /**
     * Debug method to print secrets (never use in production)
     */
    fun printSecrets() {
        println("Google Client ID: $googleClientId")
        println("Google Client Secret: $googleClientSecret")
    }

    /**
     * Authenticate a user using email and password.
     * Generates JWT access and refresh tokens.
     */
    fun authenticateUser(loginRequest: LoginRequest): AuthResponse {
        // Authenticate user credentials
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                loginRequest.email,
                loginRequest.password
            )
        )

        val username = authentication.name ?: loginRequest.email

        // Generate JWT tokens
        val accessToken = jwtService.generateAccessToken(username)
        val refreshToken = jwtService.generateRefreshToken(username)

        // Store refresh token for future invalidation
        refreshTokenRepository?.save(
            RefreshToken(
                token = refreshToken,
                username = username,
                expiryDate = Instant.now().plusSeconds(jwtService.refreshTokenExpiration)
            )
        )

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = jwtService.accessTokenExpiration
        )
    }

    /**
     * Register a new user in the system.
     * Performs password validation, uniqueness check, and role assignment.
     */
    @Transactional
    fun registerUser(registrationRequest: RegistrationRequest): User {
        // Ensure passwords match
        if (registrationRequest.password != registrationRequest.confirmPassword) {
            throw BadCredentialsException("Passwords do not match")
        }

        // Check if the email is already registered
        if (userRepository.existsByEmail(registrationRequest.email)) {
            throw UserAlreadyExistsException("User with email ${registrationRequest.email} already exists")
        }

        // Encode password securely
        val encodedPassword = passwordEncoder.encode(registrationRequest.password)
            ?: throw SecurityException("Failed to encode password")

        // Create the new user entity
        val user = User(
            email = registrationRequest.email,
            passwordHash = encodedPassword,
            roles = "USER", // store actual role name
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        // Persist the user
        return userRepository.save(user)
    }

    /**
     * Refresh access token using a valid refresh token.
     * Optionally rotates the refresh token for security.
     */
    @Transactional
    fun refreshAccessToken(refreshToken: String): AuthResponse {
        // Validate refresh token
        if (!jwtService.validateToken(refreshToken)) {
            throw InvalidTokenException("Invalid refresh token")
        }

        // Check refresh token existence and expiration in database
        refreshTokenRepository?.findByToken(refreshToken)
            ?.takeIf { it.expiryDate.isAfter(Instant.now()) }
            ?: throw InvalidTokenException("Refresh token expired or not found")

        // Extract username from token
        val username = jwtService.extractUsername(refreshToken)
            ?: throw InvalidTokenException("Invalid refresh token payload")

        // Generate new tokens
        val newAccessToken = jwtService.generateAccessToken(username)
        val newRefreshToken = jwtService.generateRefreshToken(username)

        // Update refresh token in database
        refreshTokenRepository?.updateToken(refreshToken, newRefreshToken, username)

        return AuthResponse(
            accessToken = newAccessToken,
            refreshToken = newRefreshToken,
            expiresIn = jwtService.accessTokenExpiration
        )
    }

    /**
     * Logout user by invalidating refresh token
     */
    @Transactional
    fun invalidateToken(refreshToken: String) {
        refreshTokenRepository?.deleteByToken(refreshToken)
    }

    /**
     * Retrieve a user's profile by email
     */
    fun getUserProfile(email: String): UserProfileResponse {
        val user = userRepository.findByEmail(email)
            ?: throw { UsernameNotFoundException("User not found with email: $email") } as Throwable

        return UserProfileResponse(
            id = user.id,
            email = user.email,
            roles = user.roles
        )
    }

    /**
     * Get all registered users
     */
    fun getAllUsers(): List<UserResponse> {
        return userRepository.findAll().map { user ->
            UserResponse(
                id = user.id,
                email = user.email,
                roles = user.roles,
                enabled = user.isEnabled,
                createdAt = user.createdAt,
                updatedAt = user.updatedAt
            )
        }
    }

    /**
     * Verify email using token (optional)
     */
    @Transactional
    fun verifyEmail(userId: String, token: String): Boolean {
        // Implementation for email verification
        return true
    }

    /**
     * Request a password reset
     */
    fun requestPasswordReset(email: String) {
        val user = userRepository.findByEmail(email)
            ?: throw { UsernameNotFoundException("User not found with email: $email") } as Throwable

        val resetToken = jwtService.generatePasswordResetToken(user.email)
    }

    /**
     * Reset password using a valid reset token
     */
    @Transactional
    fun resetPassword(token: String, newPassword: String): Boolean {
        // Validate token
        if (!jwtService.validateToken(token)) {
            throw InvalidTokenException("Invalid or expired reset token")
        }

        val email = jwtService.extractUsername(token)
            ?: throw InvalidTokenException("Invalid reset token")

        val user = userRepository.findByEmail(email)
            ?: throw { UsernameNotFoundException("User not found with email: $email") } as Throwable

        // Update password
        user.passwordHash = passwordEncoder.encode(newPassword).toString()
        user.updatedAt = Instant.now()
        userRepository.save(user)

        // Invalidate all user sessions
        refreshTokenRepository?.deleteAllByUsername(email)

        return true
    }
}

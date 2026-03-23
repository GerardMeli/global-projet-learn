package com.example.manage_users.service.impl

import com.example.manage_users.config.PasswordEncoderConfig
import com.example.manage_users.dto.AdminDto
import com.example.manage_users.dto.ProfileDto
import com.example.manage_users.dto.RegistrationDto
import com.example.manage_users.execption.BadRequestException
import com.example.manage_users.execption.EmailAlreadyExistsException
import com.example.manage_users.execption.InvalidPasswordException
import com.example.manage_users.execption.ResourceNotFoundException
import com.example.manage_users.mapper.UserMapper
import com.example.manage_users.models.UserStatus
import com.example.manage_users.models.Users
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.service.interf.EmailService
import com.example.manage_users.service.interf.TokenService
import com.example.manage_users.service.interf.UsersService
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class UserServiceImpl (
    private val usersRepository: UsersRepository,
    private val passwordEncoder: PasswordEncoderConfig,
    private val userMapper: UserMapper,
    private val tokenService: TokenService,
    private val emailService: EmailService
) : UsersService, UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = usersRepository.findByEmail(username)
            .orElseThrow {
                UsernameNotFoundException("User not found with email: $username")
            }

        if (!user.isActive) {
            throw UsernameNotFoundException("User account is inactive")
        }

        val authorities = listOf(SimpleGrantedAuthority("ROLE_${user.role.name}"))

        return User.builder()
            .username(user.email)
            .password(user.password)
            .authorities(authorities)
            .accountLocked(user.status == UserStatus.BLOCKED)
            .accountExpired(false)
            .credentialsExpired(false)
            .disabled(!user.isActive)
            .build()
    }

    override fun getUserProfile(userId: String): ProfileDto.UserProfileResponse {
        val user = findUserById(userId)
        return userMapper.toProfileResponse(user)
    }

    override fun updateUserProfile(userId: String, request: ProfileDto.UserProfileUpdateRequest): ProfileDto.UserProfileResponse {
        val user = findUserById(userId)

        request.firstName?.let { user.firstName = it }
        request.lastName?.let { user.lastName = it }
        request.phoneNumber?.let { user.phoneNumber = it }
        request.address?.let { user.address = it }

        val updatedUser = usersRepository.save(user)

        return userMapper.toProfileResponse(updatedUser)
    }

    override fun updateUserPreferences(userId: String, request: ProfileDto.UserPreferencesUpdateRequest): ProfileDto.UserProfileResponse {
        val user = findUserById(userId)

        request.language?.let { user.language = it }
        request.theme?.let { user.theme = it }
        request.emailNotifications?.let { user.emailNotifications = it }

        val updatedUser = usersRepository.save(user)

        return userMapper.toProfileResponse(updatedUser)
    }

    override fun changePassword(userId: String, request: ProfileDto.PasswordChangeRequest) {
        val user = findUserById(userId)

        if (!passwordEncoder.passwordEncoder().matches(request.currentPassword, user.password)) {
            throw InvalidPasswordException("Current password is incorrect")
        }

        if (request.newPassword != request.confirmPassword) {
            throw BadRequestException("New passwords do not match")
        }

        user.password = passwordEncoder.passwordEncoder().encode(request.newPassword)
        usersRepository.save(user)
    }

    override fun requestEmailChange(userId: String, request: ProfileDto.EmailUpdateRequest) {
        val user = findUserById(userId)

        if (!passwordEncoder.passwordEncoder().matches(request.password, user.password)) {
            throw InvalidPasswordException("Password is incorrect")
        }

        if (usersRepository.existsByEmail(request.newEmail)) {
            throw EmailAlreadyExistsException("Email already in use")
        }

        val token = tokenService.createEmailChangeToken(userId, request.newEmail)
        emailService.sendEmailChangeConfirmation(request.newEmail, token)
    }

    override fun confirmEmailChange(token: String) {
        val (userId, newEmail) = tokenService.validateEmailChangeToken(token)
        val user = findUserById(userId)

        user.email = newEmail
        user.emailVerified = true
        usersRepository.save(user)

        tokenService.deleteEmailChangeToken(token)
    }


    // Admin methods
    override fun getAllUsers(): List<ProfileDto.UserProfileResponse> {
         return usersRepository.findAll()
            .map { userMapper.toProfileResponse(it) }
    }

    override fun searchUsers(
        currentUserId: String,
        query: String
    ): List<ProfileDto.PrivateUserResponse> {

        return usersRepository.searchUsersExceptCurrentUser(currentUserId, query)
            .map { user ->
                ProfileDto.PrivateUserResponse(
                    id = user.id,
                    email = user.email,
                    isActive = user.isActive,
                    role = user.role.name // ✅ enum → String
                )
            }
    }

    override fun getUserById(userId: String): ProfileDto.UserProfileResponse {
        val user = findUserById(userId)
        return userMapper.toProfileResponse(user)
    }

    override fun updateUser(userId: String, request: AdminDto.AdminUserUpdateRequest): AdminDto.AdminUserResponse {
        val user = findUserById(userId)
        val updatedUser = userMapper.updateUserFromRequest(user, request)

        return userMapper.toAdminResponse(usersRepository.save(updatedUser))
    }

    override fun updateUserStatus(userId: String, request: AdminDto.UserStatusUpdateRequest): AdminDto.AdminUserResponse {
        val user = findUserById(userId)
        user.status = request.status

        val updatedUser = usersRepository.save(user)

        // Send notification email
        emailService.sendStatusChangeNotification(user.email, request.status, request.reason)

        return userMapper.toAdminResponse(updatedUser)
    }

    override fun updateUserRole(userId: String, request: AdminDto.UserRoleUpdateRequest): AdminDto.AdminUserResponse {
        val user = findUserById(userId)
        user.role = request.role

        val updatedUser = usersRepository.save(user)

        // Send notification email
        emailService.sendRoleChangeNotification(user.email, request.role, request.reason)

        return userMapper.toAdminResponse(updatedUser)
    }

    override fun deleteUser(userId: String) {
        usersRepository.deleteById(userId)
    }

    // ── Admin: CREATE USER ────────────────────────────────────────────────────
    /**
     * Nouveau flux d'invitation :
     *  1. Persiste le user avec le mot de passe temporaire fourni par l'admin (haché).
     *  2. Génère un token password-reset JWT (24 h).
     *  3. Envoie l'email "Créez votre mot de passe" → lien /auth/set-password?token=…
     *
     * Le welcome email est déclenché par AuthController.resetPassword()
     * APRÈS que le user a réellement défini son mot de passe.
     */
    override fun createUser(request: AdminDto.CreateUserRequest): AdminDto.CreateUserResponse {
        // 1. Unicité email
        if (usersRepository.existsByEmail(request.email))
            throw EmailAlreadyExistsException("Un compte existe déjà avec l'email : ${request.email}")

        // 2. Construire l'entité
        val user = Users(
            id            = "",
            email         = request.email,
            firstName     = request.firstName,
            lastName      = request.lastName,
            password      = passwordEncoder.passwordEncoder().encode(request.password),
            role          = request.role,
            isActive      = request.isActive,
            emailVerified = true,       // créé par admin → vérifié d'office
            status        = UserStatus.ACTIVE,
            phoneNumber   = request.phoneNumber,
            address       = request.address,
        )

        // 3. Persister
        val saved = usersRepository.save(user)

        // 4. Générer token reset (24 h) et envoyer l'invitation "set-password"
        val resetToken = tokenService.createPasswordResetToken(saved.id, saved.email)
        emailService.sendSetPasswordInvitation(saved, resetToken)

        // 5. Retourner la réponse
        return AdminDto.CreateUserResponse(
            id        = saved.id,
            firstName = saved.firstName,
            lastName  = saved.lastName,
            email     = saved.email,
            role      = saved.role,
            status    = saved.status,
            isActive  = saved.isActive,
            createdAt = saved.createdAt,
        )
    }

    private fun findUserById(userId: String): Users {
        return usersRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found with id: $userId") }
    }

    override fun getAllUsersExceptCurrentUser(
        currentUserId: String
    ): List<ProfileDto.PrivateUserResponse> {

        return usersRepository.findAllExceptCurrentUser(currentUserId)
            .map { user ->
                ProfileDto.PrivateUserResponse(
                    id = user.id,
                    email = user.email,
                    isActive = user.isActive,
                    role = user.role.name // ✅
                )
            }
    }

}
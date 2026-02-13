package com.example.manage_users.service.impl

import com.example.manage_users.config.PasswordEncoderConfig
import com.example.manage_users.dto.AdminDto
import com.example.manage_users.dto.ProfileDto
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
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
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
            .accountLocked(user.status == com.example.manage_users.models.UserStatus.BLOCKED)
            .accountExpired(false)
            .credentialsExpired(false)
            .disabled(!user.isActive)
            .build()
    }

    override fun getUserProfile(userId: Long): ProfileDto.UserProfileResponse {
        val user = findUserById(userId)
        return userMapper.toProfileResponse(user)
    }

    override fun updateUserProfile(userId: Long, request: ProfileDto.UserProfileUpdateRequest): ProfileDto.UserProfileResponse {
        val user = findUserById(userId)

        request.firstName?.let { user.firstName = it }
        request.lastName?.let { user.lastName = it }
        request.phoneNumber?.let { user.phoneNumber = it }
        request.address?.let { user.address = it }

        val updatedUser = usersRepository.save(user)

        return userMapper.toProfileResponse(updatedUser)
    }

    override fun updateUserPreferences(userId: Long, request: ProfileDto.UserPreferencesUpdateRequest): ProfileDto.UserProfileResponse {
        val user = findUserById(userId)

        request.language?.let { user.language = it }
        request.theme?.let { user.theme = it }
        request.emailNotifications?.let { user.emailNotifications = it }

        val updatedUser = usersRepository.save(user)

        return userMapper.toProfileResponse(updatedUser)
    }

    override fun changePassword(userId: Long, request: ProfileDto.PasswordChangeRequest) {
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

    override fun requestEmailChange(userId: Long, request: ProfileDto.EmailUpdateRequest) {
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

    override fun confirmEmailChange(userId: Long, token: String) {
        val user = findUserById(userId)
        val newEmail = tokenService.validateEmailChangeToken(token, userId)

        user.email = newEmail
        user.emailVerified = true
        usersRepository.save(user)

        tokenService.deleteEmailChangeToken(token)
    }

    // Admin methods
    override fun getAllUsers(pageable: Pageable): AdminDto.PaginatedUsersResponse {
        val page = usersRepository.findAll(pageable)
        return toPaginatedResponse(page)
    }

    override fun searchUsers(criteria: AdminDto.UserSearchCriteria, pageable: Pageable): AdminDto.PaginatedUsersResponse {
        val page = usersRepository.searchUsers(
            criteria.email,
            criteria.firstName,
            criteria.lastName,
            criteria.role,
            pageable
        )
        return toPaginatedResponse(page)
    }

    override fun getUserById(userId: Long): AdminDto.AdminUserResponse {
        val user = findUserById(userId)
        return userMapper.toAdminResponse(user)
    }

    override fun updateUser(userId: Long, request: AdminDto.AdminUserUpdateRequest): AdminDto.AdminUserResponse {
        val user = findUserById(userId)
        val updatedUser = userMapper.updateUserFromRequest(user, request)

        return userMapper.toAdminResponse(usersRepository.save(updatedUser))
    }

    override fun updateUserStatus(userId: Long, request: AdminDto.UserStatusUpdateRequest): AdminDto.AdminUserResponse {
        val user = findUserById(userId)
        user.status = request.status

        val updatedUser = usersRepository.save(user)

        // Send notification email
        emailService.sendStatusChangeNotification(user.email, request.status, request.reason)

        return userMapper.toAdminResponse(updatedUser)
    }

    override fun updateUserRole(userId: Long, request: AdminDto.UserRoleUpdateRequest): AdminDto.AdminUserResponse {
        val user = findUserById(userId)
        user.role = request.role

        val updatedUser = usersRepository.save(user)

        // Send notification email
        emailService.sendRoleChangeNotification(user.email, request.role, request.reason)

        return userMapper.toAdminResponse(updatedUser)
    }

    override fun deleteUser(userId: Long) {
        val user = findUserById(userId)
        user.status = UserStatus.DELETED
        user.isActive = false
        usersRepository.save(user)
    }

    private fun findUserById(userId: Long): Users {
        return usersRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found with id: $userId") }
    }

    private fun toPaginatedResponse(page: Page<Users>): AdminDto.PaginatedUsersResponse {
        val content = page.content.map { user ->
            userMapper.toAdminResponse(user)
        }

        return AdminDto.PaginatedUsersResponse(
            content = content,
            page = page.number,
            size = page.size,
            totalElements = page.totalElements,
            totalPages = page.totalPages,
            last = page.isLast
        )
    }

}
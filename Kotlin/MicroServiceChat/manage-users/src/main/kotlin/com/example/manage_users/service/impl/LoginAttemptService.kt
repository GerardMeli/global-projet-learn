package com.example.manage_users.service.impl

import com.example.manage_users.models.UserStatus
import com.example.manage_users.repository.UsersRepository
import com.example.manage_users.service.interf.EmailService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional

@Service
class LoginAttemptService (
    private val usersRepository: UsersRepository,
    private val emailService: EmailService
) {
    private val log = LoggerFactory.getLogger(LoginAttemptService::class.java)

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun handleFailedLogin(userId: String) {
        usersRepository.incrementFailedLoginAttempts(userId)

        val user = usersRepository.findById(userId).orElse(null) ?: return

        log.warn("⚠️  Tentative échouée ${user.failedLoginAttempts}/5 pour userId=$userId")

        if (user.failedLoginAttempts >= 5) {
            user.status = UserStatus.BLOCKED
            usersRepository.save(user)
            emailService.sendAccountLockedNotification(user)
            log.warn("🔒 Compte bloqué : userId=$userId")
        }
    }
}
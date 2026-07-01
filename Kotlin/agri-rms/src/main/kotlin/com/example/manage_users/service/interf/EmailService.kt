package com.example.manage_users.service.interf

import com.example.manage_users.models.Users
import com.example.manage_users.utils.UserRole
import com.example.manage_users.utils.UserStatus

interface EmailService {

    fun sendEmailVerification(user: Users): String

    fun sendPasswordResetEmail(user: Users)

    fun sendAccountLockedNotification(user: Users)

    fun sendWelcomeEmail(user: Users)

    fun sendEmailChangedNotification(user: Users, oldEmail: String)

    fun sendVerificationEmail(email: String, token: String)

    fun sendPasswordResetEmailWithToken(email: String, token: String)

    fun sendEmailChangeConfirmation(email: String, token: String)

    fun sendStatusChangeNotification(email: String, status: UserStatus, reason: String?)

    fun sendRoleChangeNotification(email: String, role: UserRole, reason: String?)

    fun verifyEmail(tokenValue: String)

    fun sendAccountSetupEmail(user: Users)

}
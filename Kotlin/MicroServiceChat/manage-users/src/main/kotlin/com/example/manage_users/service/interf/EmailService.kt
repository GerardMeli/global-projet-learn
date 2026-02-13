package com.example.manage_users.service.interf

import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import com.example.manage_users.models.Users

interface EmailService {

    fun sendEmailVerification(user: Users)
    fun sendPasswordResetEmail(user: Users)
    fun sendAccountLockedNotification(user: Users)
    fun sendWelcomeEmail(user: Users)
    fun sendEmailChangedNotification(user: Users, oldEmail: String)

    fun sendVerificationEmail(email: String, token: String)
    fun sendPasswordResetEmail(email: String, token: String)
    fun sendEmailChangeConfirmation(email: String, token: String)
    fun sendStatusChangeNotification(email: String, status: UserStatus, reason: String?)
    fun sendRoleChangeNotification(email: String, role: UserRole, reason: String?)

}
package com.example.manage_users.service.interf

interface TokenService {

    fun generateVerificationToken(email: String): String
    fun validateVerificationToken(token: String): String
    fun generatePasswordResetToken(email: String): String
    fun validatePasswordResetToken(token: String): String
    fun invalidateAllUserTokens(userId: Long)
    fun isTokenValid(token: String, email: String): Boolean

    fun createEmailVerificationToken(userId: Long): String
    fun validateEmailVerificationToken(token: String): Long
    fun deleteEmailVerificationToken(token: String)

    fun createPasswordResetToken(userId: Long): String
    fun deletePasswordResetToken(token: String)

    fun createEmailChangeToken(userId: Long, newEmail: String): String
    fun validateEmailChangeToken(token: String, userId: Long): String
    fun deleteEmailChangeToken(token: String)

}
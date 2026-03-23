package com.example.manage_users.service.interf

interface TokenService {

    fun generateVerificationToken(email: String): String

    fun validateVerificationToken(token: String): String

    fun generatePasswordResetToken(email: String): String

    fun validatePasswordResetToken(token: String): String

    fun invalidateAllUserTokens(userId: String)

    fun isTokenValid(token: String, email: String): Boolean

    fun createEmailVerificationToken(userId: String): String

    fun validateEmailVerificationToken(token: String): String

    fun deleteEmailVerificationToken(token: String)

    fun createPasswordResetToken(userId: String, email: String): String

    fun deletePasswordResetToken(token: String)

    fun createEmailChangeToken(userId: String, newEmail: String): String

    fun validateEmailChangeToken(token: String): Pair<String, String>

    fun deleteEmailChangeToken(token: String)

}
package com.example.manage_users.service.impl

import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import com.example.manage_users.models.Users
import com.example.manage_users.security.JwtProvider
import com.example.manage_users.service.interf.EmailService
import jakarta.mail.internet.MimeMessage
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.thymeleaf.TemplateEngine
import org.thymeleaf.context.Context

@Service
class EmailServiceImpl (
    private val mailSender: JavaMailSender,
    private val templateEngine: TemplateEngine,
    private val jwtTokenProvider: JwtProvider,
    @Value("\${app.base-url:http://localhost:8082}")
    private val baseUrl: String,
    @Value("\${app.email.from:ngandjougerard@gmail.com}")
    private val fromEmail: String,
    @Value("\${app.email.enabled:false}")
    private val emailEnabled: Boolean,
    @Value("\${app.frontend-url:http://localhost:4200}")
    private val frontendUrl: String,
) : EmailService {

    companion object {
        private val log = LoggerFactory.getLogger(EmailServiceImpl::class.java)
    }
//
//    init {
//        log.info("📧 EmailServiceImpl initialized")
//        log.info("📧 Email sending enabled: $emailEnabled")
//        log.info("📧 Base URL: $baseUrl")
//        log.info("📧 From email: $fromEmail")
//    }

    @Async
    override fun sendEmailVerification(user: Users): String {
        try {
            val token = jwtTokenProvider.createEmailVerificationToken(user.id)
            val verificationUrl = "$baseUrl/api/auth/verify-email?token=$token"

            val mimeMessage: MimeMessage = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(mimeMessage, true, "UTF-8")

            helper.setFrom(fromEmail)
            helper.setTo(user.email)
            helper.setSubject("Email Verification")

            // Load HTML template
            val htmlContent = EmailServiceImpl::class.java
                .getResourceAsStream("/templates/email-content.html")
                ?.bufferedReader()
                ?.use { it.readText() }
                ?: throw IllegalStateException("Email template not found")

            // Replace placeholder with verification URL
            val finalHtml = htmlContent.replace("{{VERIFICATION_URL}}", verificationUrl)

            helper.setText(finalHtml, true)

            // 🚀 SEND THE EMAIL (THIS WAS MISSING)
            mailSender.send(mimeMessage)

            log.info("✅ Verification email sent to: ${user.email}")
            return "Success"

        } catch (ex: Exception) {
            log.error("❌ Failed to send verification email to ${user.email}", ex)
            return "❌ Failed to send verification email to ${user.email}: ${ex.message}"
        }
    }


    @Async
    override fun sendPasswordResetEmail(user: Users) {
        try {
            // 1️⃣ Generate token and reset URL
            val token = jwtTokenProvider.createPasswordResetToken(user.id, user.email)
            val resetUrl = "$baseUrl/api/auth/reset-password?token=$token"

            log.info("📧 Preparing password reset email for: ${user.email}")
            log.info("📧 Reset URL: $resetUrl")

            // 2️⃣ Load HTML template
            val htmlContent = EmailServiceImpl::class.java
                .getResourceAsStream("/templates/email/password-reset.html") // new template
                ?.bufferedReader()
                ?.use { it.readText() }
                ?: throw IllegalStateException("Password reset email template not found")

            // 3️⃣ Replace placeholder(s)
            val finalHtml = htmlContent.replace("{{RESET_URL}}", resetUrl)
                .replace("{{USER_NAME}}", user.firstName ?: "User") // optional

            // 4️⃣ Prepare MimeMessage
            val mimeMessage: MimeMessage = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(mimeMessage, true, "UTF-8")
            helper.setFrom(fromEmail)
            helper.setTo(user.email)
            helper.setSubject("Password Reset Request")
            helper.setText(finalHtml, true)

            // 5️⃣ Send email
            mailSender.send(mimeMessage)

            log.info("✅ Password reset email sent to: ${user.email}")

        } catch (ex: Exception) {
            log.error("❌ Failed to send password reset email to ${user.email}", ex)
        }
    }

    @Async
    override fun sendAccountLockedNotification(user: Users) {
        try {
            log.info("📧 Preparing account locked notification for: ${user.email}")

            val context = Context().apply {
                setVariable("user", user)
                setVariable("supportEmail", "support@example.com")
                // ← passer les URLs comme variables String simples
                setVariable("loginUrl",        "$frontendUrl/auth/login")
                setVariable("resetPasswordUrl","$frontendUrl/auth/reset-password")
                setVariable("supportUrl",      "$frontendUrl/support")
            }

            val content = templateEngine.process("email/account-locked", context)
            sendEmail(user.email, "Votre compte a été bloqué", content)

            log.info("✅ Account locked notification sent to: ${user.email}")
        } catch (ex: Exception) {
            log.error("❌ Failed to send account locked notification to ${user.email}", ex)
        }
    }

    @Async
    override fun sendEmailChangedNotification(user: Users, oldEmail: String) {
        try {
            log.info("📧 Preparing email changed notifications")
            log.info("📧 Old email: $oldEmail")
            log.info("📧 New email: ${user.email}")

            val context = Context().apply {
                setVariable("user", user)
                setVariable("oldEmail", oldEmail)
                setVariable("newEmail", user.email)
            }

            // Send to old email
            sendEmail(
                to = oldEmail,
                subject = "Your Email Address Has Been Changed",
                content = templateEngine.process("email/email-changed-old", context)
            )

            // Send to new email
            sendEmail(
                to = user.email,
                subject = "Email Change Confirmation",
                content = templateEngine.process("email/email-changed", context)
            )

            log.info("✅ Email changed notifications sent")
        } catch (ex: Exception) {
            log.error("❌ Failed to send email changed notifications", ex)
        }
    }

    @Async
    override fun sendVerificationEmail(email: String, token: String) {
        try {
            val verificationUrl = "$baseUrl/api/auth/verify-email?token=$token"

            log.info("📧 Preparing verification email for: $email")
            log.info("📧 Verification URL: $verificationUrl")
            log.info("📧 Token: $token")

            val context = Context().apply {
                setVariable("email", email)
                setVariable("verificationUrl", verificationUrl)
            }

            val content = templateEngine.process("email/email-verification", context)

            sendEmail(
                to = email,
                subject = "Email Verification",
                content = content
            )

            log.info("✅ Verification email sent to: $email")
        } catch (ex: Exception) {
            log.error("❌ Failed to send verification email to $email", ex)
        }
    }

    @Async
    override fun sendPasswordResetEmailWithToken(email: String, token: String) {
        try {
            val resetUrl = "$baseUrl/api/auth/reset-password?token=$token"

            log.info("📧 Preparing password reset email for: $email")
            log.info("📧 Reset URL: $resetUrl")
            log.info("📧 Token: $token")

            val context = Context().apply {
                setVariable("email", email)
                setVariable("resetUrl", resetUrl)
            }

            val content = templateEngine.process("email/password-reset", context)

            sendEmail(
                to = email,
                subject = "Password Reset Request",
                content = content
            )

            log.info("✅ Password reset email sent to: $email")
        } catch (ex: Exception) {
            log.error("❌ Failed to send password reset email to $email", ex)
        }
    }

    @Async
    override fun sendEmailChangeConfirmation(email: String, token: String) {
        try {
            val confirmUrl = "$baseUrl/api/profile/email-change-confirm?token=$token"

            log.info("📧 Preparing email change confirmation for: $email")
            log.info("📧 Confirm URL: $confirmUrl")

            val context = Context().apply {
                setVariable("email", email)
                setVariable("confirmUrl", confirmUrl)
            }

            val content = templateEngine.process("email/email-change-confirmation", context)

            sendEmail(
                to = email,
                subject = "Confirm Your Email Change",
                content = content
            )

            log.info("✅ Email change confirmation sent to: $email")
        } catch (ex: Exception) {
            log.error("❌ Failed to send email change confirmation to $email", ex)
        }
    }

    @Async
    override fun sendStatusChangeNotification(email: String, status: UserStatus, reason: String?) {
        try {
            log.info("📧 Preparing status change notification for: $email")
            log.info("📧 New status: $status")

            val context = Context().apply {
                setVariable("email", email)
                setVariable("status", status)
                setVariable("reason", reason ?: "No reason provided")
                setVariable("supportEmail", "support@example.com")
            }

            val content = templateEngine.process("email/status-change", context)

            sendEmail(
                to = email,
                subject = "Your Account Status Has Been Updated",
                content = content
            )

            log.info("✅ Status change notification sent to: $email")
        } catch (ex: Exception) {
            log.error("❌ Failed to send status change notification to $email", ex)
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NEW — Invitation « Créez votre mot de passe » (admin a créé le compte)
    // Template: resources/templates/email/set-password-invitation.html
    // ═══════════════════════════════════════════════════════════════════════
    @Async
    override fun sendSetPasswordInvitation(user: Users, token: String) {
        try {
            log.info("📧 Sending set-password invitation to: ${user.email}")

            // Pointe vers la route Angular /auth/set-password?token=<jwt>
            val setPasswordUrl = "$frontendUrl/auth/set-password?token=$token"

            val context = Context().apply {
                setVariable("user", user)
                setVariable("setPasswordUrl", setPasswordUrl)
            }

            val content = templateEngine.process("email/set-password-invitation", context)
            sendEmail(user.email, "FlowChat — Créez votre mot de passe", content)

            log.info("✅ Set-password invitation sent to: ${user.email}")
        } catch (ex: Exception) {
            log.error("❌ Failed to send set-password invitation to ${user.email}", ex)
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UPDATED — Welcome email
    // Désormais envoyé APRÈS que le user a défini son mot de passe
    // (déclenché par AuthController.resetPassword).
    // Utilise frontendUrl/home au lieu de baseUrl/login.
    // ═══════════════════════════════════════════════════════════════════════
    @Async
    override fun sendWelcomeEmail(user: Users) {
        try {
            log.info("📧 Preparing welcome email for: ${user.email}")

            val context = Context().apply {
                setVariable("user", user)
                setVariable("loginUrl", "$frontendUrl/auth/login")   // ← /home (landing)
            }

            val content = templateEngine.process("email/welcome", context)

            sendEmail(user.email, "Bienvenue sur FlowChat 🎉", content)

            log.info("✅ Welcome email sent to: ${user.email}")
        } catch (ex: Exception) {
            log.error("❌ Failed to send welcome email to ${user.email}", ex)
        }
    }

    @Async
    override fun sendRoleChangeNotification(email: String, role: UserRole, reason: String?) {
        try {
            log.info("📧 Preparing role change notification for: $email")
            log.info("📧 New role: $role")

            val context = Context().apply {
                setVariable("email", email)
                setVariable("role", role)
                setVariable("reason", reason ?: "No reason provided")
            }

            val content = templateEngine.process("email/role-change", context)

            sendEmail(
                to = email,
                subject = "Your Account Role Has Been Updated",
                content = content
            )

            log.info("✅ Role change notification sent to: $email")
        } catch (ex: Exception) {
            log.error("❌ Failed to send role change notification to $email", ex)
        }
    }

    private fun sendEmail(to: String, subject: String, content: String) {
        try {
            val message: MimeMessage = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, true, "UTF-8")

            helper.setFrom(fromEmail)
            helper.setTo(to)
            helper.setSubject(subject)
            helper.setText(content, true)

            mailSender.send(message)
        } catch (ex: Exception) {
            log.error("❌ Failed to send email", ex)
            throw ex
        }
    }
}
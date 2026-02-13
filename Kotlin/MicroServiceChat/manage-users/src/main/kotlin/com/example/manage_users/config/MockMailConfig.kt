package com.example.manage_users.config

import jakarta.mail.Session
import jakarta.mail.internet.MimeMessage
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessagePreparator
import java.io.InputStream
import java.util.*

@Configuration
@ConditionalOnProperty(
    prefix = "app.email",
    name = ["enabled"],
    havingValue = "false",
    matchIfMissing = true
)
class MockMailConfig {

    private val log = LoggerFactory.getLogger(MockMailConfig::class.java)

    init {
        log.warn("🔧 ========================================")
        log.warn("🔧 MOCK MAIL SENDER ACTIVATED")
        log.warn("🔧 Emails will be logged, not sent")
        log.warn("🔧 ========================================")
    }

    @Bean
    @Primary
    fun mockJavaMailSender(): JavaMailSender {
        log.info("📧 Creating MockJavaMailSender bean")
        return MockJavaMailSender()
    }
}

class MockJavaMailSender : JavaMailSender {
    private val log = LoggerFactory.getLogger(MockJavaMailSender::class.java)
    private val session = Session.getDefaultInstance(Properties())

    override fun send(mimeMessage: MimeMessage) {
        log.info("📧 ========================================")
        log.info("📧 MOCK EMAIL SENT")
        log.info("📧 To: ${mimeMessage.allRecipients?.joinToString()}")
        log.info("📧 Subject: ${mimeMessage.subject}")
        log.info("📧 From: ${mimeMessage.from?.joinToString()}")
        log.info("📧 ========================================")
    }

    override fun send(vararg mimeMessages: MimeMessage) {
        mimeMessages.forEach { send(it) }
    }

    override fun send(mimeMessagePreparator: MimeMessagePreparator) {
        val mimeMessage = createMimeMessage()
        mimeMessagePreparator.prepare(mimeMessage)
        send(mimeMessage)
    }

    override fun send(vararg mimeMessagePreparators: MimeMessagePreparator) {
        mimeMessagePreparators.forEach { send(it) }
    }

    override fun createMimeMessage(): MimeMessage {
        return MimeMessage(session)
    }

    override fun createMimeMessage(contentStream: InputStream): MimeMessage {
        return MimeMessage(session, contentStream)
    }

    override fun send(simpleMessage: SimpleMailMessage) {
        log.info("📧 ========================================")
        log.info("📧 MOCK SIMPLE EMAIL SENT")
        log.info("📧 To: ${simpleMessage.to?.joinToString()}")
        log.info("📧 Subject: ${simpleMessage.subject}")
        log.info("📧 Text: ${simpleMessage.text}")
        log.info("📧 ========================================")
    }

    override fun send(vararg simpleMessages: SimpleMailMessage) {
        simpleMessages.forEach { send(it) }
    }
}

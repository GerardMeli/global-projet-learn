package com.example.manage_users.security

import com.example.manage_users.models.UserRole
import com.example.manage_users.models.UserStatus
import com.example.manage_users.models.Users
import com.example.manage_users.repository.UsersRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Component
class OAuth2AuthenticationSuccessHandler (
    private val jwtProvider: JwtProvider,
    private val usersRepository: UsersRepository
) : SimpleUrlAuthenticationSuccessHandler() {

    @Transactional
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val oAuth2User = authentication.principal as OAuth2User
        val email = oAuth2User.attributes["email"] as? String
        val name = oAuth2User.attributes["name"] as? String
        val firstName = oAuth2User.attributes["given_name"] as? String
        val lastName = oAuth2User.attributes["family_name"] as? String

        if (email != null) {
            val user = usersRepository.findByEmail(email).orElseGet {
                createOAuth2User(email, name, firstName, lastName)
            }

            // Generate JWT token
            val token = jwtProvider.generateOAuth2Token(user.id, user.email, user.role.name)

            // Redirect to frontend with token
            val redirectUrl = "http://localhost:3000/oauth2/redirect?token=$token"
            response.sendRedirect(redirectUrl)
        } else {
            response.sendRedirect("http://localhost:3000/login?error=Email not found from OAuth2 provider")
        }
    }

    private fun createOAuth2User(
        email: String,
        name: String?,
        firstName: String?,
        lastName: String?
    ): Users {
        val names = name?.split(" ") ?: listOf()
        val user = Users(
            id = 0,
            email = email,
            password = "", // OAuth2 users don't have password
            firstName = firstName ?: (names.getOrNull(0) ?: ""),
            lastName = lastName ?: (names.getOrNull(1) ?: ""),
            role = UserRole.USER,
            status = UserStatus.ACTIVE,
            isActive = true,
            emailVerified = true,
            createdAt = LocalDateTime.now(),
//            oauth2Provider = extractOAuth2Provider(email)
        )
        return usersRepository.save(user)
    }

    private fun extractOAuth2Provider(email: String): String {
        return when {
            email.endsWith("@gmail.com") -> "GOOGLE"
            email.contains("facebook") -> "FACEBOOK"
            email.contains("github") -> "GITHUB"
            else -> "OAUTH2"
        }
    }
}
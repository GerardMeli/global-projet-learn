package com.reli237.web_application_chat.security

import com.reli237.web_application_chat.repository.UsersRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService (
    private val usersRepository: UsersRepository
) : UserDetailsService {

    /**
     * Load user details by username (email in this case)
     */
    override fun loadUserByUsername(username: String?): UserDetails {
        val user = usersRepository.findByEmail(username)
            .orElseThrow {
                UsernameNotFoundException("User not found with email: $username")
            }

        if (!user.isActive) {
            throw UsernameNotFoundException("User account is inactive")
        }

        // Convert UserRole to Spring Security authorities
        val authorities = listOf(SimpleGrantedAuthority("ROLE_${user.role.name}"))

        return User.builder()
            .username(user.email)
            .password(user.password)
            .authorities(authorities)
            .accountLocked(false)
            .accountExpired(false)
            .credentialsExpired(false)
            .disabled(!user.isActive)
            .build()
    }
}
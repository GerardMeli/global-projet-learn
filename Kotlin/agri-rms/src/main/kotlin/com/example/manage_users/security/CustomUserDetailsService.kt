package com.example.manage_users.security

import com.example.manage_users.repository.UsersRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

// ─────────────────────────────────────────────────────────────────────────────
//  CustomUserDetailsService
//  Charge l'utilisateur depuis la BDD à partir de son email.
//  Expose le rôle sous la forme "ROLE_<ROLE>" attendue par Spring Security.
// ─────────────────────────────────────────────────────────────────────────────

@Service
class CustomUserDetailsService(
    private val usersRepository: UsersRepository
) : UserDetailsService {

    override fun loadUserByUsername(email: String): UserDetails {
        val user = usersRepository.findByEmail(email)
            .orElseThrow { UsernameNotFoundException("Utilisateur introuvable : $email") }

        return User.builder()
            .username(user.email)
            .password(user.password)
            .authorities(SimpleGrantedAuthority("ROLE_${user.role.name}"))
            .accountExpired(false)
            .accountLocked(!user.isActive)
            .credentialsExpired(false)
            .disabled(!user.isActive)
            .build()
    }
}
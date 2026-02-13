package com.example.recipeapi.service

import com.example.recipeapi.model.User
import com.example.recipeapi.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.Collections

@Service
class CustomUserDetailsService (
    private val userRepository: UserRepository
): UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails{
        val user: User = userRepository.findByUsername(username).orElseThrow { UsernameNotFoundException("User not find with username: " + username) }

        return org.springframework.security.core.userdetails.User(
            user.username,
            user.password,
            Collections.singletonList(SimpleGrantedAuthority(user.role)))
    }
}
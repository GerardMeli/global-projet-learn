package com.example.testsecurity.repository

import com.example.testsecurity.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, Long> {
    
    // Find user by email (used for authentication)
    fun findByEmail(email: String): User
    
    // Check if user exists by email
    fun existsByEmail(email: String): Boolean
}
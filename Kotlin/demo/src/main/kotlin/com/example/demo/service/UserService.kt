package com.example.demo.service

import com.example.demo.dto.UserDto
import com.example.demo.model.User
import com.example.demo.repository.UserRepository
import com.example.demo.mapper.UserMapper

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDateTime

@Service
@Transactional
class UserService @Autowired constructor(
    private val userRepository: UserRepository
) {

    // Create new user
    fun createUser(userDto: UserDto): UserDto {
        if (userRepository.existsByEmail(userDto.email)) {
            throw IllegalArgumentException("Email already exists")
        }

        val saved = userRepository.save(UserMapper.toEntity(userDto))
        return UserMapper.toDto(saved)
    }

    // Get all users
    fun getAllUsers(): List<UserDto> =
        userRepository.findAll().map { UserMapper.toDto(it) }

    // Get user by ID
    fun getUserById(id: Long): UserDto =
        userRepository.findById(id)
            .orElseThrow { NoSuchElementException("User not found") }
            .let { UserMapper.toDto(it) }

    // Update user
    fun updateUser(id: Long, dto: UserDto): UserDto {
        val user = userRepository.findById(id)
            .orElseThrow { NoSuchElementException("User not found") }

        user.firstname = dto.firstname
        user.lastname = dto.lastname
        user.email = dto.email
        user.gender = dto.gender
        user.address = dto.address
        user.phoneNumber = dto.phoneNumber

        return UserMapper.toDto(userRepository.save(user))
    }

    // Delete user
    fun deleteUser(id: Long) {
        if (!userRepository.existsById(id)) {
            throw NoSuchElementException("User not found")
        }
        userRepository.deleteById(id)
    }

    // Find by email
    fun findByEmail(email: String): UserDto =
        userRepository.findByEmail(email).let { UserMapper.toDto(it) }
}
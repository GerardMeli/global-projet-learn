package com.example.recipeapi.controller

import com.example.recipeapi.configuration.JwtUtils
import com.example.recipeapi.model.User
import com.example.recipeapi.repository.UserRepository
import com.example.recipeapi.request.UserRequest
import lombok.extern.slf4j.Slf4j
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.AuthenticationException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
@Slf4j
class AuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtils: JwtUtils,
    private val authenticationManager: AuthenticationManager

) {


    private val log = LoggerFactory.getLogger(AuthController::class.java)

    @PostMapping("/register")
    fun register(@RequestBody user: UserRequest): ResponseEntity<Any> {

        if (userRepository.findByUsername(user.unaername).isPresent) {
            return ResponseEntity.badRequest()
                .body("Username is already in use")
        }

        val newUser = User(
            id = 0,
            username = user.unaername,
            password = passwordEncoder.encode(user.password),
            role = "ROLE_USER"
        )

        userRepository.save(newUser)

        return ResponseEntity.ok("User registered successfully")
    }

    @PostMapping("/login")
    fun login(@RequestBody user: UserRequest): ResponseEntity<Any> {
        return try {
            val authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(
                    user.unaername,
                    user.password
                )
            )

            if (authentication.isAuthenticated) {
                val authData = hashMapOf<String, Any>(
                    "token" to jwtUtils.generateToken(user.unaername),
                    "type" to "Bearer"
                )
                ResponseEntity.ok(authData)
            } else {
                ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password")
            }
        } catch (e: AuthenticationException) {
            log.error(e.message)
            ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid username or password")
        }
    }
}

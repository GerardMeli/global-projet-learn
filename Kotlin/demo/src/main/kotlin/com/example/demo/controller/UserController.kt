package com.example.demo.controller

import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDateTime

import com.example.demo.service.UserService
import com.example.demo.dto.UserDto

@RestController
@RequestMapping("/api/users")
class UserController @Autowired constructor(
    private val userService: UserService
) {

    // --------------------------------------------
    // Create new user
    // POST /api/users
    // --------------------------------------------
    @PostMapping("/add/user")
    fun createUser(@RequestBody dto: UserDto): ResponseEntity<UserDto> {
        val createdUser = userService.createUser(dto)
        return ResponseEntity.ok(createdUser)
    }

    // --------------------------------------------
    // Get all users
    // GET /api/users
    // --------------------------------------------
    @GetMapping("/all/users")
    fun getAllUsers(): ResponseEntity<List<UserDto>> {
        val users = userService.getAllUsers()
        return ResponseEntity.ok(users)
    }

    // --------------------------------------------
    // Get user by ID
    // GET /api/users/{id}
    // --------------------------------------------
    @GetMapping("/{id}")
    fun getUserById(@PathVariable id: Long): ResponseEntity<UserDto> {
        val user = userService.getUserById(id)
        return ResponseEntity.ok(user)
    }

    // --------------------------------------------
    // Update a user
    // PUT /api/users/{id}
    // --------------------------------------------
    @PutMapping("/{id}")
    fun updateUser(
        @PathVariable id: Long,
        @RequestBody dto: UserDto
    ): ResponseEntity<UserDto> {
        val updatedUser = userService.updateUser(id, dto)
        return ResponseEntity.ok(updatedUser)
    }

    // --------------------------------------------
    // Delete a user
    // DELETE /api/users/{id}
    // --------------------------------------------
    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<Void> {
        userService.deleteUser(id)
        return ResponseEntity.noContent().build()
    }

    // --------------------------------------------
    // Find user by email
    // GET /api/users/email/{email}
    // --------------------------------------------
    @GetMapping("/email/{email}")
    fun findByEmail(@PathVariable email: String): ResponseEntity<UserDto> {
        val user = userService.findByEmail(email)
        return ResponseEntity.ok(user)
    }
}
package com.example.manage_users.controller

import com.example.manage_users.dto.AdminDto
import com.example.manage_users.service.interf.UsersService
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
class AdminController (
    private val userService: UsersService
) {

    @GetMapping
    fun getAllUsers(
        @PageableDefault(size = 20, sort = ["id"], direction = Sort.Direction.DESC) pageable: Pageable
    ): ResponseEntity<AdminDto.PaginatedUsersResponse> {
        val response = userService.getAllUsers(pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/search")
    fun searchUsers(
        @ModelAttribute criteria: AdminDto.UserSearchCriteria,
        @PageableDefault(size = 20, sort = ["id"], direction = Sort.Direction.DESC) pageable: Pageable
    ): ResponseEntity<AdminDto.PaginatedUsersResponse> {
        val response = userService.searchUsers(criteria, pageable)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{userId}")
    fun getUserById(@PathVariable userId: Long): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.getUserById(userId)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{userId}")
    fun updateUser(
        @PathVariable userId: Long,
        @Valid @RequestBody request: AdminDto.AdminUserUpdateRequest
    ): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.updateUser(userId, request)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/{userId}/status")
    fun updateUserStatus(
        @PathVariable userId: Long,
        @Valid @RequestBody request: AdminDto.UserStatusUpdateRequest
    ): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.updateUserStatus(userId, request)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/{userId}/role")
    fun updateUserRole(
        @PathVariable userId: Long,
        @Valid @RequestBody request: AdminDto.UserRoleUpdateRequest
    ): ResponseEntity<AdminDto.AdminUserResponse> {
        val response = userService.updateUserRole(userId, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{userId}")
    fun deleteUser(@PathVariable userId: Long): ResponseEntity<Void> {
        userService.deleteUser(userId)
        return ResponseEntity.noContent().build()
    }
}
package com.example.demo.mapper

import com.example.demo.dto.UserDto
import com.example.demo.model.User
import java.time.LocalDateTime

object UserMapper {

    fun toDto(user: User): UserDto =
        UserDto(
            id = user.id,
            firstname = user.firstname,
            lastname = user.lastname,
            email = user.email,
            gender = user.gender,
            address = user.address,
            phoneNumber = user.phoneNumber,
            createdAt = user.createdAt,
            orders = user.orders.map { it.id }
        )

    fun toEntity(dto: UserDto): User =
        User(
            id = dto.id ?: 0,
            firstname = dto.firstname,
            lastname = dto.lastname,
            email = dto.email,
            gender = dto.gender,
            address = dto.address,
            phoneNumber = dto.phoneNumber,
            createdAt = dto.createdAt ?: LocalDateTime.now()
        )
}
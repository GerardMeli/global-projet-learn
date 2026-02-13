package com.example.demo.dto

import com.example.demo.model.User
import java.time.LocalDateTime
import java.math.BigDecimal

data class UserDto(
    var id: Long? = null,
    var firstname: String = "",
    var lastname: String = "",
    var email: String = "",
    var gender: String = "",
    var address: String = "",
    var phoneNumber: String = "",
    var createdAt: LocalDateTime? = null,
    var orders: List<Long> = emptyList() // ids only, avoids circular JSON
)


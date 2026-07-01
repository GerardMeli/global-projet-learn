package com.example.manage_users.utils

import com.example.manage_users.models.UserRole
import java.util.UUID

object UsersIdGenerator {

    fun forAgri() = generate("AGRICULTURE")
    fun forRole(role: UserRole) = generate("${role}")

    private fun generate(prefix: String): String {
        val shortUUID = UUID
            .randomUUID()
            .toString()
            .replace("-", "")
            .take(8)
            .uppercase()

        return "${prefix}_$shortUUID"
    }

}
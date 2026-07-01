package com.example.manage_users.utils

import java.util.UUID

object FilesIdGenerator {

    fun generate(prefix: String): String {
        val shortUUID = UUID
            .randomUUID()
            .toString()
            .replace("-", "")
            .take(8)
            .uppercase()

        return "${prefix}_$shortUUID"
    }

}
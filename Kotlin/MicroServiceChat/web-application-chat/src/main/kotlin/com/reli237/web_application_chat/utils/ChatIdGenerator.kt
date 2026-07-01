package com.example.manage_users.utils

import java.util.UUID

object ChatIdGenerator {

    fun forChatParticipant() = generate("CHAT_PARTICIPANT")
    fun forChatRoom() = generate("CHAT_ROOM")
    fun forMesage() = generate("MESSAGE")
    fun forPrivate() = generate("PRIVATE")

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
package com.example.manage_users.service.interf

import com.example.manage_users.dto.EmbedVerifyRequest
import com.example.manage_users.dto.EmbedVerifyResponse

interface EmbedAuthService {

    fun verifyAndGenerateChatToken(request: EmbedVerifyRequest): EmbedVerifyResponse
}
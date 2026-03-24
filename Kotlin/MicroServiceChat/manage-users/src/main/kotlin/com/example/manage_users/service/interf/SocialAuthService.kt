package com.example.manage_users.service.interf

import com.example.manage_users.dto.SocialAuthResponse

interface SocialAuthService {

    fun authenticateWithSocial(idToken: String): SocialAuthResponse

}
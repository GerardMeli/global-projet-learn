package com.example.manage_users.service.interf

import com.google.firebase.auth.FirebaseToken

interface FirebaseAuthService {

    fun extractEmail(token: FirebaseToken): String
    fun extractProvider(token: FirebaseToken): String
    fun verifyIdToken(idToken: String): FirebaseToken

}
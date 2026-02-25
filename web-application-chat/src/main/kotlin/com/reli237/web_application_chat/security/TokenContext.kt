package com.reli237.web_application_chat.security

object TokenContext {

    private val tokenHolder = ThreadLocal<String?>()

    fun set(token: String?) = tokenHolder.set(token)
    fun get(): String? = tokenHolder.get()
    fun clear() = tokenHolder.remove()

}
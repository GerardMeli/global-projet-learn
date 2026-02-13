package com.example.demo.controller

import org.springframework.beans.factory.annotation.Value
import org.springframework.data.convert.ValueConverter
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HelloController {

    @Value("\${app.api.key}")
    private lateinit var  apiKey: String

    @GetMapping("/api")
    fun sayApiKey(): String {
        return apiKey
    }

    @Value("\${app.database.url}")
    private lateinit var  dbUrl: String

    @GetMapping("/db")
    fun sayDbKey(): String {
        return dbUrl
    }
}
package com.reli237.apigateway

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/")
@RestController
class HelloController {

    @GetMapping
    fun hello(): String{
        return "Hello World"
    }
}
package com.reli237.web_application_chat

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients

@SpringBootApplication
@EnableFeignClients
class WebApplicationChatApplication

fun main(args: Array<String>) {
	runApplication<WebApplicationChatApplication>(*args)
}

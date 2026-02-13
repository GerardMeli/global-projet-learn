package com.example.serveurdiscovery

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer

@SpringBootApplication
@EnableEurekaServer
class ServeurdiscoveryApplication

fun main(args: Array<String>) {
	runApplication<ServeurdiscoveryApplication>(*args)
}

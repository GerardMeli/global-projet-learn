package com.eureka.server_side

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer

@SpringBootApplication
@EnableEurekaServer
class ServerSideApplication

fun main(args: Array<String>) {
	runApplication<ServerSideApplication>(*args)
}

package com.gateway.system_manager_file

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan
class SystemManagerFileApplication

fun main(args: Array<String>) {
	runApplication<SystemManagerFileApplication>(*args)
}

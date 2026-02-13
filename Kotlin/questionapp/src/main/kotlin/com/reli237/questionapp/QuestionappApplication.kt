package com.reli237.questionapp

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient

@SpringBootApplication
@EnableDiscoveryClient
class QuestionappApplication

fun main(args: Array<String>) {
	runApplication<QuestionappApplication>(*args)
}

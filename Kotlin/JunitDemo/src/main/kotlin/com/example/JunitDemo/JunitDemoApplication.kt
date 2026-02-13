package com.example.JunitDemo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class JunitDemoApplication

fun main(args: Array<String>) {
	runApplication<JunitDemoApplication>(*args)
}

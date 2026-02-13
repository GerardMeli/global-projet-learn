package com.example.testsecurity.config

import io.github.cdimascio.dotenv.Dotenv
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class EnvConfig {

//    @Bean
//    fun dotenv(): Dotenv {
//        return Dotenv.configure()
//            .directory(System.getProperty("user.dir")) // project root
//            .ignoreIfMissing() // don't fail if .env missing
//            .load()
//    }
}
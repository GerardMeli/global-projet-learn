package com.example.vote.onlinevote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@SpringBootApplication
//@EnableJpaRepositories(basePackages = "com.example.vote.onlinevote.repository")
//@EntityScan(basePackages = "com.example.vote.onlinevote.model")
public class OnlinevoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlinevoteApplication.class, args);

        System.out.println("Hello World Spring Boot!");
    }

}

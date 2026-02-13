package com.example.ecommercecart.ecommercecart.repository;

// import java.time.LocalDateTime;
// import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ecommercecart.ecommercecart.model.Command;

public interface CommandRepository extends JpaRepository<Command, Long> {

    // List<Command> findCommandByDate(LocalDateTime orderDate);

}

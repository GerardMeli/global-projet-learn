package com.example.ecommercecart.ecommercecart.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ecommercecart.ecommercecart.model.Users;

public interface UsersRepository extends JpaRepository<Users, Long> {

    List<Users> findUsersByName(String name);
    List<Users> findUsersByEmail(String email);

}

package com.example.blogpersonal.blogpersonal.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.blogpersonal.blogpersonal.model.Like;

public interface LikeRepository extends JpaRepository<Like, Long> {
    
}

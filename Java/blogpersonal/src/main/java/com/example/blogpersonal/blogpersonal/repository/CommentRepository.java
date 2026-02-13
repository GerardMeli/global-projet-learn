package com.example.blogpersonal.blogpersonal.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.blogpersonal.blogpersonal.model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    

}

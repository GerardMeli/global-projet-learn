package com.example.vote.onlinevote.repository;

import com.example.vote.onlinevote.model.Election;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ElectionRepository extends JpaRepository<Election, Long> {
}

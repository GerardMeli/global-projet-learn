package com.example.vote.onlinevote.repository;

import com.example.vote.onlinevote.model.Voter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoterRepository extends JpaRepository<Voter, Long> {
    List<Voter> findAllByFirstnameContaining(String username);

    Optional<Voter> findByEmail(String email);
}

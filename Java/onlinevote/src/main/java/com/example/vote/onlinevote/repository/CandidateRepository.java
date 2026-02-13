package com.example.vote.onlinevote.repository;

import com.example.vote.onlinevote.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findAllByFirstnameContaining(String username);

}

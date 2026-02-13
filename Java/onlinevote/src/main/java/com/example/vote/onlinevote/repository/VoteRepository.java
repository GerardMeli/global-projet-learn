package com.example.vote.onlinevote.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.vote.onlinevote.model.Election;
import com.example.vote.onlinevote.model.Vote;
import com.example.vote.onlinevote.model.Voter;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    
    boolean existsByVoterAndElection(Voter voter, Election election);

    // @Query("SELECT v.candidate.id AS candidateId, v.candidate.name AS candidateName, COUNT(v) AS voteCount " +
    //        "FROM Vote v WHERE v.election.id = :electionId GROUP BY v.candidate.id, v.candidate.name ORDER BY voteCount DESC")
    // List<CandidateVoteCount> countVotesByElection(@Param("electionId") Long electionId);

    interface CandidateVoteCount {
        Long getCandidateId();
        String getCandidateName();
        Long getVoteCount();
    }
}

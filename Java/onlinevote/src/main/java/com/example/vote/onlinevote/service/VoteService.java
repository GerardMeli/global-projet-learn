package com.example.vote.onlinevote.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.vote.onlinevote.model.Candidate;
import com.example.vote.onlinevote.model.Election;
import com.example.vote.onlinevote.model.Vote;
import com.example.vote.onlinevote.model.Voter;
import com.example.vote.onlinevote.repository.VoteRepository;

@Service
public class VoteService {

    @Autowired
    private VoteRepository voteRepository;

    public boolean hasAlreadyVoted(Voter voter, Election election) {
        return voteRepository.existsByVoterAndElection(voter, election);
    }

    public void castVote(Voter voter, Candidate candidate, Election election) {
        if (hasAlreadyVoted(voter, election)) {
            throw new IllegalStateException("You have already voted in this election.");
        }

        Vote vote = new Vote();
        vote.setVoter(voter);
        vote.setCandidate(candidate);
        vote.setElection(election);
        vote.setVoteTime(LocalDateTime.now());

        voteRepository.save(vote);
    }

    // public List<VoteRepository.CandidateVoteCount> countVotesByElection(Long electionId) {
    //     return voteRepository.countVotesByElection(electionId);
    // }

    // public List<VoteRepository.CandidateVoteCount> getResultsByElection(Long electionId) {
    //     return voteRepository.countVotesByElection(electionId);
    // }

    
}

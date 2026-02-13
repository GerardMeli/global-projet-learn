package com.example.vote.onlinevote.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.vote.onlinevote.dto.VoteRequestDto;
import com.example.vote.onlinevote.model.Candidate;
import com.example.vote.onlinevote.model.Election;
import com.example.vote.onlinevote.model.Voter;
import com.example.vote.onlinevote.repository.CandidateRepository;
import com.example.vote.onlinevote.repository.ElectionRepository;
import com.example.vote.onlinevote.repository.VoterRepository;
import com.example.vote.onlinevote.service.VoteService;


@RestController
@RequestMapping("/api/vote")
public class VoteController {

    @Autowired
    private VoteService voteService;

    @Autowired
    private VoterRepository voterRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ElectionRepository electionRepository;

    @PostMapping
    public ResponseEntity<?> castVote(@RequestBody VoteRequestDto voteRequest) {
        // Validate incoming IDs
        if (voteRequest.getVoterId() == null || voteRequest.getCandidateId() == null || voteRequest.getElectionId() == null) {
            return ResponseEntity.badRequest().body("voterId, candidateId, and electionId are required.");
        }

        // Load entities from database
        Voter voter = voterRepository.findById(voteRequest.getVoterId())
                .orElseThrow(() -> new RuntimeException("Voter not found"));
        Candidate candidate = candidateRepository.findById(voteRequest.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Election election = electionRepository.findById(voteRequest.getElectionId())
                .orElseThrow(() -> new RuntimeException("Election not found"));

        try {
            voteService.castVote(voter, candidate, election);
            return ResponseEntity.ok("Vote cast successfully!");
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    // @GetMapping("/{electionId}")
    // public ResponseEntity<?> getResults(@PathVariable Long electionId) {
    //     List<VoteRepository.CandidateVoteCount> results = voteService.getResultsByElection(electionId);
    //     return ResponseEntity.ok(results);
    // }
}


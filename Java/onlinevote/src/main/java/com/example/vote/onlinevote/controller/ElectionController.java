package com.example.vote.onlinevote.controller;


import com.example.vote.onlinevote.dto.ElectionDto;
import com.example.vote.onlinevote.dto.VoterDto;
import com.example.vote.onlinevote.model.Election;
import com.example.vote.onlinevote.model.Voter;
import com.example.vote.onlinevote.service.ElectionService;
import com.example.vote.onlinevote.service.VoterService;

import lombok.Getter;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Getter
public class ElectionController {

    private final ElectionService electionService;
    private final VoterService voterService;

    public ElectionController(ElectionService electionService) {
        this.electionService = electionService;
        this.voterService = null;
    }

    @PostMapping("/election/add")
    public ElectionDto addElection(
            @RequestBody ElectionDto election
    ) {
        return electionService.addElection(election);
    }

    @GetMapping("/election/show")
    public ResponseEntity<List<ElectionDto>> showElections() {
        List<ElectionDto> elections = electionService.getAllElections();
        return ResponseEntity.ok(elections);
    }

    @GetMapping("/register/{electionId}")
    public String showRegistrationForm(@PathVariable Long electionId, Model model) {
        Election election = electionService.getElectionById(electionId);
        model.addAttribute("election", election);
        model.addAttribute("voter", new Voter());
        return "voter"; // Template for registration form
    }

    @PostMapping("/register/{electionId}")
    public String processRegistration(
            @PathVariable Long electionId,
            @ModelAttribute("voter") VoterDto voter,
            BindingResult result,
            Model model) {
        
        if (result.hasErrors()) {
            model.addAttribute("election", electionService.getElectionById(electionId));
            return "election/register";
        }

        voterService.registerVoter(electionId, voter);
        return "redirect:/elections/" + electionId + "?registered";
    }

}

package com.example.vote.onlinevote.controller;

import com.example.vote.onlinevote.dto.CandidateDto;
import com.example.vote.onlinevote.dto.CandidateResponseDto;
import com.example.vote.onlinevote.model.Voter;
import com.example.vote.onlinevote.service.CandidateService;
import com.example.vote.onlinevote.service.UserService;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Getter
public class CandidateController {

    private final CandidateService candidateService;
    private final UserService userService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
        this.userService = null;
    }

    // @GetMapping("/candidate/add")
    public String showRegistrationForm(Model model) {
        if (!model.containsAttribute("voter")) {
            model.addAttribute("voter", new Voter());
        }
        return "signin"; // This should match your Thymeleaf template name
    }

    @PostMapping("/candidate/add")
    public CandidateResponseDto add(
            @RequestBody CandidateDto candidateDto
    ) {
        return candidateService.savedCandidate(candidateDto);
    }

    @PostMapping
    public String saveCandidate(
            @RequestParam Long userId,
            @RequestParam(required = false) Float deposit,
            @RequestParam(required = false) Integer score) {
        
        candidateService.createCandidate(userId, deposit, score);
        return "redirect:/candidates";
    }

    @GetMapping("/candidate/display")
    public List<CandidateResponseDto> display() {
        return candidateService.findAllCandidates();
    }

    @GetMapping("/candidate/find/{id}")  // Get User with her id
    public CandidateResponseDto getCandidateById(
            @PathVariable Long id
    ){
        return candidateService.findCandidateById(id);
    }

    @GetMapping("/candidate/search/{candidate_name}")  // et User with her name
    public List<CandidateResponseDto> findRegistrationsByFirstName(
            @PathVariable("candidate_name") String firstName
    ){
        return candidateService.findCandidateByFirstname(firstName);
    }

    @DeleteMapping("/candidate/delete/{vote-id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void deleteRegistrationById(
            @PathVariable("vote-id") Long id
    ) {
        candidateService.deleteCandidateById(id);
    }
}

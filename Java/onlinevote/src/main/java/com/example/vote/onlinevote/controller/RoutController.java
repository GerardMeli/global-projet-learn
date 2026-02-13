package com.example.vote.onlinevote.controller;

import com.example.vote.onlinevote.dto.CandidateDto;
import com.example.vote.onlinevote.dto.ElectionDto;
import com.example.vote.onlinevote.dto.VoteOfficeDto;
import com.example.vote.onlinevote.dto.VoterDto;
import com.example.vote.onlinevote.exception.ResourceNotFoundException;
import com.example.vote.onlinevote.model.Voter;
import com.example.vote.onlinevote.service.VoterService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class RoutController {

    private final VoterService voterService;
    // private final VoterRepository voterRepository;
    // private final CandidateRepository candidateRepository;
    // private final ElectionRepository electionRepository;

    public RoutController(VoterService voterService
                        //   VoterRepository voterRepository,
                        //   CandidateRepository candidateRepository,
                        //   ElectionRepository electionRepository
                        ) {
        this.voterService = voterService;
        // this.voterRepository = voterRepository;
        // this.candidateRepository = candidateRepository;
        // this.electionRepository = electionRepository;
    }

    @GetMapping("/")
    public String home() {
        return "index"; // This will return index.html from templates folder
        // For static index.html, you don't even need this controller
    }

    @GetMapping("/voter")
    public String showRegistrationForm(Model model) {
        if (!model.containsAttribute("voter")) {
            model.addAttribute("voter", new VoterDto());
        }
        return "voter"; // This should match your Thymeleaf template name
    }

    @GetMapping("/success")
    public String showSuccessPage(Model model) {
        model.addAttribute("message", "You have successfully registered to vote.");
        return "success";
    }

    @GetMapping("/election/add")
    public String showElectionForm(Model model) {
        if (!model.containsAttribute("election")) {
            model.addAttribute("election", new ElectionDto());
        }
        return "election"; // This should match your Thymeleaf template name
    }

    @GetMapping("/candidate/add")
    public String showCandidateForm(Model model) {
        if (!model.containsAttribute("candidate")) {
            model.addAttribute("candidate", new CandidateDto());
        }
        return "candidate"; // This should match your Thymeleaf template name
    }

    @GetMapping("/voteoffice/add")
    public String showVoteForm(Model model) {
        if (!model.containsAttribute("voteoffice")) {
            model.addAttribute("voteoffice", new VoteOfficeDto());
        }
        return "voteoffice"; // This should match your Thymeleaf template name
    }

    @GetMapping("/dash")
    public String showDashboard() { 
        return "dash";
    }

    // Or for combined page
    @GetMapping("/auth")
    public String showAuthPage() {
        return "auth"; // combined login/register page
    }

    @GetMapping("/display_election")
    public String displayElections() {
        // You can add any model attributes if needed
        return "display_election"; // This should match your Thymeleaf template name
    }

    @GetMapping("/disp_voter")
    public String displayVoters(Model model) {
        model.addAttribute("voters", voterService.showAllVoters());
        return "disp_voter"; // This should match your Thymeleaf template name
    }

    @GetMapping("/displ_cand")
    public String displayCandidates() {
        return "displ_cand"; // This should match your Thymeleaf template name
    }

    @GetMapping("/vote_office_display")
    public String displayVoteOffices() {
        return "vote_office_display"; // This should match your Thymeleaf template name
    }

    @PostMapping("/voters/{id}/send-verification")
    @ResponseBody
    public ResponseEntity<?> sendVerificationEmail(@PathVariable Long id) {
        try {
            Voter voter = voterService.getVoterById(id);
            if (voter == null) {
                return ResponseEntity.notFound().build();
            }

//            // INTERNAL_SERVER_ERRORmplement email sending logic here
//            emailService.sendVerificationEmail(
//                    voter.getEmail(),
//                    "Voter Registration Verification",
//                    "Your voter registration has been verified. Thank you!"
//            );

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/voters/{id}/print")
    public String getPrintTemplate(@PathVariable Long id, Model model) {
        Voter voter = voterService.getVoterById(id);
        if (voter == null) {
            throw new ResourceNotFoundException("Voter not found");
        }

        model.addAttribute("voter", voter);
        return "print_voter"; // You'll need to create this Thymeleaf template
    }

}

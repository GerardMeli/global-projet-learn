package com.example.vote.onlinevote.controller;

import com.example.vote.onlinevote.dto.VoterDto;
import com.example.vote.onlinevote.dto.VoterResponseDto;
import com.example.vote.onlinevote.service.ElectionService;
import com.example.vote.onlinevote.service.VoteOfficeService;
import com.example.vote.onlinevote.service.VoterService;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@Getter
@Controller
@RestController
public class VoterController {

    private final VoterService voterService;
    private final VoteOfficeService voteOfficeService;
    private final ElectionService electionService;

    public VoterController(VoterService voterService, VoteOfficeService voteOfficeService, ElectionService electionService) {
        this.voterService = voterService;
        this.voteOfficeService = voteOfficeService;
        this.electionService = electionService;
    }

    @PostMapping("/voter/add")
    public String register(@ModelAttribute VoterDto voterDto, Model model) {
        VoterResponseDto savedVoter = voterService.saveVoter(voterDto);
        model.addAttribute("voter", savedVoter);
        return "success"; // or another Thymeleaf template name
    }

    // public String showRegistrationForm(Model model) {
    //     model.addAttribute("voter", new Voter());
    //     model.addAttribute("voteOffices", voteOfficeService.showVoteOffices());
    //     // model.addAttribute("elections", electionService.getAllElections());
    //     // model.addAttribute("roles", Role.values());
    //     return "voter";
    // }

    @GetMapping("/voter/display")
    public List<VoterResponseDto> show() {
        return voterService.showAllVoters();
    }

    @GetMapping("/voter/find/{id}")  // Get User with her id
    public VoterResponseDto getVoterById(
            @PathVariable Long id
    ){
        return voterService.findVoterById(id);
    }

    @GetMapping("/voter/search/{voter_name}")  // et User with her name
    public List<VoterResponseDto> findRegistrationsByFirstName(
            @PathVariable("voter_name") String firstName
    ){
        return voterService.findVoterByFirstName(firstName);
    }

    @DeleteMapping("/voter/delete/{vote-id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void deleteVoterById(
            @PathVariable("vote-id") Long id
    ) {
        voterService.deleteRegistrationById(id);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValidationException(
            MethodArgumentNotValidException exp
    ) {
        var errors = new HashMap<String, String>();
        exp.getBindingResult().getAllErrors()
                .forEach(error -> {
                    var fieldName = ((FieldError) error).getField();
                    var message = error.getDefaultMessage();
                    errors.put(fieldName, message);
                });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}

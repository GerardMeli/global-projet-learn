package com.example.vote.onlinevote.controller;

import com.example.vote.onlinevote.dto.VoteOfficeDto;
import com.example.vote.onlinevote.service.VoteOfficeService;

import lombok.Getter;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Getter
@RestController
public class VoteOfficeController {
    
    private final VoteOfficeService  voteOfficeService;

    public VoteOfficeController(VoteOfficeService voteOfficeService) {
        this.voteOfficeService = voteOfficeService;
    }

    @PostMapping("/vote_office/add")
    public VoteOfficeDto addVoteOffice(
            @RequestBody VoteOfficeDto voteOfficeDto
    ) {
        return voteOfficeService.addVoteOffice(voteOfficeDto);
    }


    @GetMapping("/vote_office/get")
    public List<VoteOfficeDto> showVoteOffices() {
        return voteOfficeService.showVoteOffices();
    }

    @GetMapping("/vote_office/{id}")
    public VoteOfficeDto getVoteOffice(@PathVariable Long id) {
        return voteOfficeService.getVoteOfficeById(id);
    }
    
}

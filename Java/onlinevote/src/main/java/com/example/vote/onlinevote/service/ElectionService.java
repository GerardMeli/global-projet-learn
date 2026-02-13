package com.example.vote.onlinevote.service;

import com.example.vote.onlinevote.dto.ElectionDto;
import com.example.vote.onlinevote.mapper.ElectionMapper;
import com.example.vote.onlinevote.model.Election;
import com.example.vote.onlinevote.repository.ElectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ElectionService {

    private final ElectionRepository electionRepository;
    private final ElectionMapper electionMapper;

    public ElectionService(ElectionRepository electionRepository, ElectionMapper electionMapper) {
        this.electionRepository = electionRepository;
        this.electionMapper = electionMapper;
    }

//    public ElectionDto getElectionById(Long electionId) {
//        return electionMapper.toElectionDto(electionRepository.getOne(electionId));
//    }

    public ElectionDto addElection(ElectionDto electionDto) {
        var election = electionMapper.toElection(electionDto);
        var savedElection = electionRepository.save(election);
        return electionMapper.toElectionDto(savedElection);
    }

    public List<ElectionDto> getAllElections() {
        return electionRepository.findAll()
                .stream()
                .map(electionMapper::toElectionDto)
                .collect(Collectors.toList());
    }

    public Election getElectionById(Long id) {
        return electionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Election not found with id: " + id));
    }
}

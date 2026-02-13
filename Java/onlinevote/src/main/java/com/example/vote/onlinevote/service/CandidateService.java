package com.example.vote.onlinevote.service;

import com.example.vote.onlinevote.dto.CandidateDto;
import com.example.vote.onlinevote.dto.CandidateResponseDto;
import com.example.vote.onlinevote.mapper.CandidateMapper;
import com.example.vote.onlinevote.repository.CandidateRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final CandidateMapper candidateMapper;

    public CandidateService(CandidateRepository candidateRepository, CandidateMapper candidateMapper) {
        this.candidateRepository = candidateRepository;
        this.candidateMapper = candidateMapper;
    }

    public CandidateResponseDto savedCandidate(
            CandidateDto candidateDto
    ) {
        var candidate = candidateMapper.candidateDtoToCandidate(candidateDto);
        var savedCandidate = candidateRepository.save(candidate);
        return candidateMapper.candidateToResponseDto(savedCandidate);
    }

    public List<CandidateResponseDto> findAllCandidates() {
        return candidateRepository.findAll()
                .stream()
                .map(candidateMapper::candidateToResponseDto)
                .collect(Collectors.toList());
    }

    public CandidateResponseDto findCandidateById(
            Long id
    ) {
        return candidateRepository.findById(id)
                .map(candidateMapper::candidateToResponseDto)
                .orElse(null);
    }

    public List<CandidateResponseDto> findCandidateByFirstname(String firstname) {
        return candidateRepository.findAllByFirstnameContaining(firstname)
                .stream()
                .map(candidateMapper::candidateToResponseDto)
                .collect(Collectors.toList());
    }

    public void deleteCandidateById(Long id){
        candidateRepository.deleteById(id);
    }

    public void createCandidate(Long userId, Float deposit, Integer score) {
        // CandidateDto candidateDto = new CandidateDto();
        // candidateDto.setUserId(userId);
        // candidateDto.setDeposit(deposit);
        // candidateDto.setScore(score);
        // savedCandidate(candidateDto);
    }
}

package com.example.vote.onlinevote.mapper;

import com.example.vote.onlinevote.dto.CandidateDto;
import com.example.vote.onlinevote.dto.CandidateResponseDto;
import com.example.vote.onlinevote.model.Candidate;
import com.example.vote.onlinevote.model.Election;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CandidateMapper {

    public CandidateResponseDto candidateToResponseDto(Candidate candidate) {
        return new CandidateResponseDto(
                candidate.getFirstname(),
                candidate.getLastname(),
                candidate.getBirthdate(),
                candidate.getGender(),
                candidate.getPlaceofbirth(),
                candidate.getLocation(),
                candidate.getRegion(),
                candidate.getDepartment(),
                candidate.getArron(),
                candidate.getParty(),
                candidate.getRole()
        );
    }

    public Candidate candidateDtoToCandidate(CandidateDto candidateDto) {
        Candidate candidate = new Candidate();

        candidate.setFirstname(candidateDto.getFirstname());
        candidate.setLastname(candidateDto.getLastname());
        candidate.setBirthdate(candidateDto.getBirthdate());
        candidate.setGender(candidateDto.getGender());
        candidate.setPlaceofbirth(candidateDto.getPlaceofbirth());
        candidate.setEmail(candidateDto.getEmail());
        candidate.setLocation(candidateDto.getLocation());
        candidate.setNumber(candidateDto.getNumber());
        candidate.setRegion(candidateDto.getRegion());
        candidate.setDepartment(candidateDto.getDepartment());
        candidate.setArron(candidateDto.getArron());
        candidate.setParty(candidateDto.getParty());
        candidate.setCurrentregion(candidateDto.getCurrentregion());

        // Convert Election IDs to Election entities (with only ID set)
        List<Election> elections = new ArrayList<>();
        if (candidateDto.getRegisteredElectionIds() != null) {
            for (Long id : candidateDto.getRegisteredElectionIds()) {
                Election election = new Election();
                election.setIdElection(id);
                elections.add(election);
            }
        }
        candidate.setRegister(elections);

        candidate.setRole(candidateDto.getRole());
        candidate.setDeposit(candidateDto.getDeposit());
        candidate.setScore(candidateDto.getScore());

        return candidate;
    }
}


package com.example.vote.onlinevote.mapper;


import com.example.vote.onlinevote.dto.VoterDto;
import com.example.vote.onlinevote.dto.VoterResponseDto;
import com.example.vote.onlinevote.model.Election;
import com.example.vote.onlinevote.model.VoteOffice;
import com.example.vote.onlinevote.model.Voter;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class VoterMapper {

    public Voter toVoter(VoterDto voterDto) {
        Voter voter = new Voter();

        voter.setFirstname(voterDto.getFirstname());
        voter.setLastname(voterDto.getLastname());
        voter.setBirthdate(voterDto.getBirthdate());
        voter.setGender(voterDto.getGender());
        voter.setPlaceofbirth(voterDto.getPlaceofbirth());
        voter.setEmail(voterDto.getEmail());
        voter.setLocation(voterDto.getLocation());
        voter.setNumber(voterDto.getNumber());
        voter.setRegion(voterDto.getRegion());
        voter.setDepartment(voterDto.getDepartment());
        voter.setArron(voterDto.getArron());
        voter.setParty(voterDto.getParty());
        voter.setCurrentregion(voterDto.getCurrentregion());

        // Convertir les IDs en objets Election
        List<Election> elections = new ArrayList<>();
        if (voterDto.getRegisteredElectionIds() != null) {
            for (Long id : voterDto.getRegisteredElectionIds()) {
                Election election = new Election();
                election.setIdElection(id);
                elections.add(election);
            }
        }
        voter.setRegister(elections);

        voter.setRole(voterDto.getRole());

        if (voterDto.getOfficeId() != null) {
            VoteOffice voteOffice = new VoteOffice();
            voteOffice.setIdOffice(voterDto.getOfficeId());
            voter.setOffice(voteOffice);
        }

        return voter;
    }

    public VoterResponseDto toVoterResponseDto(Voter voter) {
        return new VoterResponseDto(
                voter.getFirstname(),
                voter.getLastname(),
                voter.getBirthdate(),
                voter.getGender(),
                voter.getPlaceofbirth(),
                voter.getLocation(),
                voter.getNumber(),
                voter.getRegion(),
                voter.getDepartment(),
                voter.getArron(),
                voter.getParty(),
                voter.getRole()
        );
    }
}

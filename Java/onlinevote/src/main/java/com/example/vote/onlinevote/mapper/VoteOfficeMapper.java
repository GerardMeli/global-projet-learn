package com.example.vote.onlinevote.mapper;

import com.example.vote.onlinevote.dto.VoteOfficeDto;
import com.example.vote.onlinevote.model.VoteOffice;
import com.example.vote.onlinevote.model.Voter;
import com.example.vote.onlinevote.repository.VoterRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VoteOfficeMapper {

    @Autowired
    private VoterRepository voterRepository;

    public VoteOfficeDto toVoteOfficeDto(VoteOffice voteOffice) {
        List<Long> voterIds = voteOffice.getVoters()
                .stream()
                .map(Voter::getId)
                .collect(Collectors.toList());

        int votersCount = voterIds.size();

        VoteOfficeDto dto = new VoteOfficeDto();
        dto.setNameOffice(voteOffice.getNameOffice());
        dto.setLocationOffice(voteOffice.getLocationOffice());
        dto.setDescriptionOffice(voteOffice.getDescriptionOffice());
        dto.setRegisterVoterIds(voterIds);
        dto.setCountVoter(votersCount);

        return dto;
    }

    public VoteOffice toVoteOffice(VoteOfficeDto voteOfficeDto) {
        List<Voter> voters = new ArrayList<>();

        if (voteOfficeDto.getRegisterVoterIds() != null && !voteOfficeDto.getRegisterVoterIds().isEmpty()) {
            voters = voterRepository.findAllById(voteOfficeDto.getRegisterVoterIds());
        }


        VoteOffice voteOffice = new VoteOffice();
        voteOffice.setNameOffice(voteOfficeDto.getNameOffice());
        voteOffice.setLocationOffice(voteOfficeDto.getLocationOffice());
        voteOffice.setDescriptionOffice(voteOfficeDto.getDescriptionOffice());
        voteOffice.setVoters(voters);

        return voteOffice;
    }
}
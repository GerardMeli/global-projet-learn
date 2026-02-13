package com.example.vote.onlinevote.mapper;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.vote.onlinevote.dto.ElectionDto;
import com.example.vote.onlinevote.model.Election;
import com.example.vote.onlinevote.model.User;
import com.example.vote.onlinevote.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ElectionMapper {

    private final UserRepository userRepository;

    @Autowired
    public ElectionMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Convert Election -> ElectionDto
    public ElectionDto toElectionDto(Election election) {
        List<Long> userIds = election.getUsers()
                .stream()
                .map(User::getId)
                .collect(Collectors.toList());

        return new ElectionDto(
                election.getElectionName(),
                election.getElectionDescription(),
                election.getElectionStatus(),
                election.getElectionStartDate(),
                election.getElectionEndDate(),
                userIds
        );
    }

    // Convert ElectionDto -> Election
    public Election toElection(ElectionDto electionDto) {
        // List<User> users = userRepository.findAllById(electionDto.getRegisteredVoterIds());

            List<User> users = new ArrayList<>();
    
            if (electionDto.getRegisteredVoterIds() != null) {
                users = userRepository.findAllById(electionDto.getRegisteredVoterIds());
            }

        Election election = new Election();
        election.setElectionName(electionDto.getElectionName());
        election.setElectionDescription(electionDto.getElectionDescription());
        election.setElectionStatus(electionDto.getElectionStatus());
        election.setElectionStartDate(electionDto.getElectionStartDate());
        election.setElectionEndDate(electionDto.getElectionEndDate());
        election.setUsers(users);

        return election;
    }
}



package com.example.vote.onlinevote.dto;

import com.example.vote.onlinevote.model.User;

import java.time.LocalDate;

public record VoterResponseDto(
        String firstname,
        String lastname,
        LocalDate birthdate,
        String gender,
        String placeofbirth,
        String location,
        Integer number,
        String region,
        String department,
        String arron,
        String party,
        User.Role role
) {
}

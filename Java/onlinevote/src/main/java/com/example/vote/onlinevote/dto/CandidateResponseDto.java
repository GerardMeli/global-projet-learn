package com.example.vote.onlinevote.dto;

import com.example.vote.onlinevote.model.User;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;

public record CandidateResponseDto(
        @NotEmpty
        String firstname,
        @NotEmpty
        String lastname,
        LocalDate birthdate,
        String gender,
        String placeofbirth,
        String location,
        String region,
        String department,
        String arron,
        String party,
        User.Role role
) {
}

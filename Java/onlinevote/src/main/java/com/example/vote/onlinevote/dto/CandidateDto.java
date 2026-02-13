package com.example.vote.onlinevote.dto;

import com.example.vote.onlinevote.model.User;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDto {

    private Long userId;

    @NotEmpty
    private String firstname;

    @NotEmpty
    private String lastname;

    private LocalDate birthdate;
    private String gender;
    private String placeofbirth;
    private String email;
    private String location;
    private Integer number;
    private String region;
    private String department;
    private String arron;
    private String party;
    private String currentregion;
    private List<Long> registeredElectionIds;
    private User.Role role;
    private Float deposit;
    private Integer score;
}

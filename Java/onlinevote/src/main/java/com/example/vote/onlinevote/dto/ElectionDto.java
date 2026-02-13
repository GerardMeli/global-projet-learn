package com.example.vote.onlinevote.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

import com.example.vote.onlinevote.model.Election;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ElectionDto {

    @NotBlank(message = "Election name is required")
    @Size(min = 3, max = 100, message = "Election name must be between 3 and 100 characters")
    private String electionName;

    @NotBlank(message = "Election description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String electionDescription;

    @NotNull(message = "Election status is required")
    private Election.StatusElec electionStatus;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate electionStartDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDate electionEndDate;

    @NotNull(message = "You must select at least one voter")
    @Size(min = 1, message = "At least one voter must be registered")
    private List<Long> registeredVoterIds;

    // Constructors

}


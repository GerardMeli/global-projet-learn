package com.example.vote.onlinevote.dto;

import com.example.vote.onlinevote.model.User;
import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class VoterDto {
        
    @NotEmpty
    @Size(min = 3, max = 50, message = "First name must be between 3 and 50 characters")
    @Pattern(regexp = "[A-Za-z\\s\\-']+", message = "First name can only contain letters, spaces, hyphens, and apostrophes")
    private String firstname;

    @NotEmpty
    @Size(min = 3, max = 50, message = "Last name must be between 3 and 50 characters")
    @Pattern(regexp = "[A-Za-z\\s\\-']+", message = "Last name can only contain letters, spaces, hyphens, and apostrophes")
    private String lastname;

    @NotNull(message = "Birth date is required")
    @Past(message = "Birthdate must be in the past")
    private LocalDate birthdate;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String placeofbirth;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 50, message = "Location must be between 3 and 50 characters")
    private String location;

    @NotNull(message = "Phone number is required")
    @Pattern(regexp = "^[6-9][0-9]{8}$", message = "Phone number must be 9 digits starting with 6-9")
    private Integer number;

    @NotBlank(message = "Region is required")
    @Size(min = 3, max = 50, message = "Region must be between 3 and 50 characters")
    private String region;

    @NotBlank(message = "Department is required")
    @Size(min = 3, max = 50, message = "Department must be between 3 and 50 characters")
    private String department;

    @NotBlank(message = "Arrondissement is required")
    @Size(min = 3, max = 50, message = "Arrondissement must be between 3 and 50 characters")
    private String arron;

    @NotBlank(message = "Political party is required")
    private String party;

    @NotBlank(message = "Current region is required")
    private String currentregion;

    @NotBlank(message = "Polling station is required")
    private String pollingstation;

    private List<Long> registeredElectionIds;

    private User.Role role;

    private Long officeId;
        
} 


package com.example.vote.onlinevote.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Election {

    @Id
    @GeneratedValue
    private Long idElection;
    private String electionName;
    private String electionDescription;

    @Enumerated(EnumType.STRING)
    private StatusElec electionStatus;

    private LocalDate electionStartDate;
    private LocalDate electionEndDate;

    @ManyToMany(mappedBy = "register", cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
//    @JsonManagedReference(value = "user-election")
    private List<User> users = new ArrayList<>();

    public enum StatusElec {
        ACTIVE, UPCOMING, ENDED, SCHEDULED  // Add SCHEDULED to match existing data
    }

}

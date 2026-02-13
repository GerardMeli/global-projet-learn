package com.example.vote.onlinevote.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class VoteOffice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOffice;
    @Column(unique = true)
    private String nameOffice;
    private String locationOffice;
    private String descriptionOffice;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "office")
    @JsonManagedReference(value = "office-voter")  // Changed to match the back reference
    private List<Voter> voters;

}


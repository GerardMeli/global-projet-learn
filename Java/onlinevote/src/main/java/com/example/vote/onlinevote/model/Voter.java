package com.example.vote.onlinevote.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("VOTER")
@Getter
@Setter
public class Voter extends User {

    @ManyToOne
    @JoinColumn(name = "office_id_office")
    @JsonBackReference(value = "office-voter")  // Changed to match
    private VoteOffice office;

    public Voter() {
        super();
    }

    public Voter(User user, VoteOffice office) {
        super();
        this.office = office;
    }
}

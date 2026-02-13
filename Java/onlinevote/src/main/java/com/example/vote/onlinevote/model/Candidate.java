package com.example.vote.onlinevote.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@DiscriminatorValue("CANDIDATE")
public class Candidate extends User {

    private Float deposit;
    private Integer score;

    public Candidate() {
        super();
    }

    public Candidate(User user, Float deposit, Integer score) {
        super();
        this.deposit = deposit;
        this.score = score;
    }
    

}

package com.example.vote.onlinevote.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VoteRequestDto {

    private Long voterId;
    private Long electionId;
    private Long candidateId;

}

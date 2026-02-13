package com.example.vote.onlinevote.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class VoteOfficeDto{

    private String nameOffice;
    private String locationOffice;
    private String descriptionOffice;
    private List<Long> registerVoterIds;
    private int countVoter;
}

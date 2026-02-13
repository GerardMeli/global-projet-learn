package com.example.vote.onlinevote.service;

import com.example.vote.onlinevote.dto.VoterDto;
import com.example.vote.onlinevote.dto.VoterResponseDto;
import com.example.vote.onlinevote.exception.ResourceNotFoundException;
import com.example.vote.onlinevote.mapper.VoterMapper;
import com.example.vote.onlinevote.model.Election;
import com.example.vote.onlinevote.model.VoteOffice;
import com.example.vote.onlinevote.model.Voter;
import com.example.vote.onlinevote.repository.ElectionRepository;
import com.example.vote.onlinevote.repository.VoteOfficeRepository;
import com.example.vote.onlinevote.repository.VoterRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoterService {

    private final VoterRepository voterRepository;
    private final VoterMapper voterMapper;
    private final ElectionRepository electionRepository;
    private final VoteOfficeRepository voteOfficeRepository;

    public VoterService(VoterRepository voterRepository, VoterMapper voterMapper, ElectionRepository electionRepository, VoteOfficeRepository voteOfficeRepository) {
        this.voterRepository = voterRepository;
        this.voterMapper = voterMapper;
        this.electionRepository = electionRepository;
        this.voteOfficeRepository = voteOfficeRepository;
    }

    public VoterResponseDto saveVoter(VoterDto voterDto) {
        var voter = voterMapper.toVoter(voterDto);
        var savedVoter = voterRepository.save(voter);
        return voterMapper.toVoterResponseDto(savedVoter);
    }

    public List<VoterResponseDto> showAllVoters() {
        return voterRepository.findAll()
                .stream()
                .map(voterMapper::toVoterResponseDto)
                .collect(Collectors.toList());
    }

    public VoterResponseDto findVoterById(
            Long id
    ){
        return voterRepository.findById(id)
                .map(voterMapper::toVoterResponseDto)
                .orElse(null);
    }

    public List<VoterResponseDto> findVoterByFirstName(
            String firstName
    ){
        return voterRepository.findAllByFirstnameContaining(firstName)
                .stream()
                .map(voterMapper::toVoterResponseDto)
                .collect(Collectors.toList());
    }

     public boolean emailExists(String email) {
        return voterRepository.findByEmail(email).isPresent();
    }

    public void deleteRegistrationById(
            Long id
    ) {
        voterRepository.deleteById(id);
    }

    public Voter getVoterById(Long id) {
        return voterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voter not found with ID: " + id));
    }

    public void registerVoter(Long electionId, VoterDto voterForm) {
        // Récupérer les élections par leurs ID
        List<Election> elections = electionRepository.findAllById(voterForm.getRegisteredElectionIds());

        if (elections.size() != voterForm.getRegisteredElectionIds().size()) {
            throw new EntityNotFoundException("One or more elections not found");
        }

        Voter voter = new Voter();

        // Copier les données depuis le formulaire
        voter.setFirstname(voterForm.getFirstname());
        voter.setLastname(voterForm.getLastname()); // Corrigé (avant c'était firstname deux fois)
        voter.setBirthdate(voterForm.getBirthdate());
        voter.setGender(voterForm.getGender());
        voter.setPlaceofbirth(voterForm.getPlaceofbirth());
        voter.setEmail(voterForm.getEmail());
        voter.setLocation(voterForm.getLocation());
        voter.setNumber(voterForm.getNumber());
        voter.setRegion(voterForm.getRegion());
        voter.setDepartment(voterForm.getDepartment());
        voter.setArron(voterForm.getArron());
        voter.setParty(voterForm.getParty());
        voter.setCurrentregion(voterForm.getCurrentregion());

        // Associer les élections
        voter.setRegister(elections);

        // Définir le rôle
        voter.setRole(voterForm.getRole());

        // Lier au bureau de vote
        VoteOffice office = voteOfficeRepository.findById(voterForm.getOfficeId())
            .orElseThrow(() -> new EntityNotFoundException("VoteOffice not found with id: " + voterForm.getOfficeId()));
        voter.setOffice(office);

        // Sauvegarder dans la base
        voterRepository.save(voter);
    }


}

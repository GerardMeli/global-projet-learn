package com.example.vote.onlinevote.service;

import com.example.vote.onlinevote.dto.VoteOfficeDto;
import com.example.vote.onlinevote.mapper.VoteOfficeMapper;
import com.example.vote.onlinevote.repository.VoteOfficeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoteOfficeService {

    private final VoteOfficeRepository voteOfficeRepository;
    private final VoteOfficeMapper voteOfficeMapper;

    public VoteOfficeService(VoteOfficeRepository voteOfficeRepository, VoteOfficeMapper voteOfficeMapper) {
        this.voteOfficeRepository = voteOfficeRepository;
        this.voteOfficeMapper = voteOfficeMapper;
    }

    public VoteOfficeDto addVoteOffice(VoteOfficeDto voteOfficeDto) {
        var voteOffice = voteOfficeMapper.toVoteOffice(voteOfficeDto);
        var savedVoteOffice = voteOfficeRepository.save(voteOffice);
        return voteOfficeMapper.toVoteOfficeDto(savedVoteOffice);
    }

    public List<VoteOfficeDto> showVoteOffices() {
        return voteOfficeRepository.findAll()
                .stream()
                .map(voteOfficeMapper::toVoteOfficeDto)
                .collect(Collectors.toList())
                ;
    }

    public VoteOfficeDto getVoteOfficeById(Long id) {
        return voteOfficeRepository.findById(id)
                .map(voteOfficeMapper::toVoteOfficeDto)
                .orElseThrow(() -> new IllegalArgumentException("Vote office not found with id: " + id));
    }

}

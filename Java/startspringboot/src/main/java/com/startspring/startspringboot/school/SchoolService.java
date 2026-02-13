package com.startspring.startspringboot.school;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchoolService {

    private final SchoolMapper schoolMapper;
    private final SchoolRepository schoolRepository;

    public SchoolService(SchoolMapper schoolMapper, SchoolRepository schoolRepository) {
        this.schoolMapper = schoolMapper;
        this.schoolRepository = schoolRepository;
    }

    public School save(School school) {
        return schoolRepository.save(school);
    }

    public List<School> findAll(School school) {
        return schoolRepository.findAll();
    }
}

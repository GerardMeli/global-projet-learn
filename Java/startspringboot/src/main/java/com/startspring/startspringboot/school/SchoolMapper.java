package com.startspring.startspringboot.school;

import org.springframework.stereotype.Service;

@Service
public class SchoolMapper {

    private final SchoolRepository schoolRepository;

    public SchoolMapper(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

}

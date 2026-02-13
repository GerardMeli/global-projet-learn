package com.startspring.startspringboot.school;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SchoolController {

    private final SchoolService schoolService;

    public SchoolController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    @PostMapping("/schools")
    public School create(@RequestBody School school) {
        return schoolService.save(school);
    }

    @GetMapping("/schools")
    public List<School> findAll(@RequestBody School school) {
        return schoolService.findAll(school);
    }
}

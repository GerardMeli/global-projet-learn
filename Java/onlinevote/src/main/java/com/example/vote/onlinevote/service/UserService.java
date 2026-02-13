package com.example.vote.onlinevote.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.vote.onlinevote.model.User;
import com.example.vote.onlinevote.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findNonCandidateUsers() {
        return userRepository.findByRoleNot("CANDIDATE");
    }
}

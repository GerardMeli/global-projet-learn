package com.example.ecommercecart.ecommercecart.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ecommercecart.ecommercecart.model.Users;
import com.example.ecommercecart.ecommercecart.repository.UsersRepository;

import lombok.Getter;

@Service
@Getter
public class UsersService {

    @Autowired
    private UsersRepository usersRepository;

    public UsersService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    public Users saveUsers(Users users) {
        var savedUser = usersRepository.save(users);
        return savedUser;
    }

    public void deleteUsersById(long id) {
        usersRepository.deleteById(id);
    }

    public Users getUsersById(long id) {
        var getIdUsers = usersRepository.findById(id).orElse(null);
        return getIdUsers;
    }

    public List<Users> getAllUsers() {
        var getAll = usersRepository.findAll();
        return getAll;
    }

    public Users updatUsers(Users users) {
        var updatedUsers = usersRepository.save(users);
        return updatedUsers;
    }

    public List<Users> findByNamUsers(String name) {
        var findName = usersRepository.findUsersByName(name);
        return findName;
    }

    public List<Users> findEmailUsers(String email) {
        var findEmail = usersRepository.findUsersByEmail(email);
        return findEmail;
    }

}

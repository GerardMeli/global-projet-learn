package com.example.ecommercecart.ecommercecart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecommercecart.ecommercecart.model.Users;
import com.example.ecommercecart.ecommercecart.service.UsersService;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@RequestMapping("/users")
@RestController
public class UsersController {

    private final UsersService usersService;

    @PostMapping("/addUser")
    public Users addNewUsers(
        @RequestBody Users users
    ) {
        var newUser = usersService.saveUsers(users);
        return newUser;
    }

    @DeleteMapping("/removeUser/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void removeUser(
        @PathVariable long id
    ) {
        usersService.deleteUsersById(id);
    }

    @GetMapping("/allUsers")
    public List<Users> getAllUsers() {
        var allUsers = usersService.getAllUsers();
        return allUsers;
    }

    @GetMapping("/user/{id}")
    public Users getIdUsers(
        @PathVariable long id
    ) {
        var idUsers = usersService.getUsersById(id);
        return idUsers;
    }

    @GetMapping("/getName/{name}")
    public List<Users> getUsersByName(
        @PathVariable String name
    ) {
        var userName = usersService.findByNamUsers(name);
        return userName;
    }

    @GetMapping("/getName/{email}")
    public List<Users> getUsersByEmail(
        @PathVariable String email
    ) {
        var userEmail = usersService.findByNamUsers(email);
        return userEmail;
    }

    @PutMapping("/updatedUser")
    public Users updateUsers(
        @RequestBody Users users
    ) {
        var updatedUser = usersService.updatUsers(users);
        return updatedUser;
    }

}

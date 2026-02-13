package com.example.vote.onlinevote.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
// This class is currently empty, but can be expanded with fields and methods as needed.
// It serves as a placeholder for login-related functionality in the application.
// You can add fields like username, password, and methods for authentication, etc.
public class Login {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userName;
    private String passWord;
    private String role;
    private String email;

    // Additional fields and methods can be added here as needed
    public String takeEmail() {

        var user = new User();
        String mail = user.getEmail();

        if (mail == null || mail.isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }

        if (!email.equals(mail)) {
            throw new IllegalArgumentException("Email does not match the user's email");
        }
        return mail;
        
    }

}
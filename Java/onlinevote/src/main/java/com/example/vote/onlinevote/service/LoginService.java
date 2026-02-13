// package com.example.vote.onlinevote.service;

// import org.springframework.stereotype.Service;

// import com.example.vote.onlinevote.model.User;
// import com.example.vote.onlinevote.repository.LoginRepository;

// @Service

// public class LoginService {

//     private final LoginRepository loginRepository;
//     private final User user;

//     public LoginService(LoginRepository loginRepository) {
//         this.loginRepository = loginRepository;
//         this.user = new User(); // Assuming user is initialized here, replace with actual user retrieval logic
//     }

//     public String checkUserEmailInformation(String email) {

//         String mail = user.getEmail();

//         if (mail == null || mail.isEmpty()) {
//             throw new IllegalArgumentException("Email cannot be null or empty");
//         }

//         if (!email.equals(mail)) {
//             throw new IllegalArgumentException("Email does not match the user's email");
//         }
//         return loginRepository.checkUserEmailInformation(email);
//     }

// }
// package com.example.vote.onlinevote.service;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.stereotype.Service;

// import com.example.vote.onlinevote.model.Login;
// import com.example.vote.onlinevote.model.LoginPrincipal;
// import com.example.vote.onlinevote.repository.LoginRepository;

// @Service
// public class MyUserDetailsService implements UserDetailsService {

//     // This service will load user-specific data for authentication and authorization
//     @Autowired
//     private LoginRepository loginRepository;

//     @Override
//     public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        
//         Login login = loginRepository.findByUsername(username);

//         if (login == null) {
//             throw new UsernameNotFoundException("User not found");
//         }

//         return new LoginPrincipal(login);

        
//     }

// }

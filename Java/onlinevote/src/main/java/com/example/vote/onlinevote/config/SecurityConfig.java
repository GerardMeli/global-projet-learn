// package com.example.vote.onlinevote.config;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.authentication.AuthenticationProvider;
// import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
// import org.springframework.security.config.Customizer;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//     @Autowired
//     private UserDetailsService userDetailsService;

//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

//         return http
//             .csrf(customizer -> customizer.disable())
//             .authorizeHttpRequests(request -> request.anyRequest().authenticated())
//             .formLogin(Customizer.withDefaults())
//             .build();
            
            
//             // A CSRF token, or Cross-Site Request Forgery token, is a security measure used to prevent malicious websites from tricking users into performing actions on a website they are logged into without their knowledge
//         // http.logout(logout -> logout.logoutUrl("/logout").logoutSuccessUrl("/login?logout").permitAll());

       
//         // return http
//         //         .csrf().disable() // Disable CSRF for simplicity, not recommended for production
//         //         .authorizeRequests()
//         //             .antMatchers("/public/**").permitAll() // Allow public access to certain endpoints
//         //             .anyRequest().authenticated() // All other requests require authentication
//         //         .and()
//         //         .formLogin() // Enable form-based login
//         //             .loginPage("/login") // Custom login page
//         //             .permitAll() // Allow everyone to see the login page
//         //         .and()
//         //         .logout() // Enable logout functionality
//         //             .permitAll(); // Allow everyone to log out
//     }

//     @Bean
//     public AuthenticationProvider authenticationProvider () {
//         DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
//         daoAuthenticationProvider.setPasswordEncoder(new BCryptPasswordEncoder(12));
//         daoAuthenticationProvider.setUserDetailsService(userDetailsService);
//         return daoAuthenticationProvider;
//     }

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }


//     // @Bean 
//     // public UserDetailsService userDetailsService() {

//     //     UserDetails user1Details = User
//     //                             .withDefaultPasswordEncoder()
//     //                             .username("reli")
//     //                             .password("admin12")
//     //                             .roles("ADMIN")
//     //                             .build();

//     //     return new InMemoryUserDetailsManager(user1Details);
//     // }

// }
 
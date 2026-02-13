// package com.example.vote.onlinevote.model;

// import java.util.Set;

// import jakarta.persistence.CollectionTable;
// import jakarta.persistence.Column;
// import jakarta.persistence.ElementCollection;
// import jakarta.persistence.Entity;
// import jakarta.persistence.FetchType;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.Table;
// import jakarta.persistence.UniqueConstraint;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;

// @Entity
// @Table(name = "user_credentials",
//        uniqueConstraints = @UniqueConstraint(name = "uk_user_email", columnNames = "email"))
// @Getter
// @Setter 
// @NoArgsConstructor 
// @AllArgsConstructor 
// @Builder
// public class UserCredentials {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @Column(nullable = false, length = 160)
//     private String email;

//     @Column(nullable = false)
//     private String passwordHash;        // store only the hash

//     @ElementCollection(fetch = FetchType.EAGER)
//     @CollectionTable(name = "user_roles")
//                     //  joinColumns = @JoinColumn(name = "user_id"))
//     @Column(name = "role")
//     private Set<Role> roles;

//     private boolean isFirstLogin = true; // default to true

//     public enum Role { 
//         VOTER, CANDIDATE, ADMIN 
//     }

// }
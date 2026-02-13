package com.example.ecommercecart.ecommercecart.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Command {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer quantity;
    private String status; // e.g., "PENDING", "SHIPPED", "DELIVERED"
    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "command")
    @JsonManagedReference(value = "command-products")
    private List<Products> products;

    @OneToMany(mappedBy = "command")
    @JsonManagedReference(value = "command-users")
    private List<Users> users;

}

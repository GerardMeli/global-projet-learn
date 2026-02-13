package com.example.blogpersonal.blogpersonal.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity class representing a Customer (User) in the system.
 * A customer can create posts, write comments, and like posts/comments.
 * This is the main user entity for the social media platform.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Entity // Marks this class as a JPA entity (database table)
@Getter // Lombok: Generates getters for all fields
@Setter // Lombok: Generates setters for all fields
@AllArgsConstructor // Lombok: Generates constructor with all arguments
@NoArgsConstructor // Lombok: Generates no-argument constructor
public class Customer {

    /**
     * Primary key for the Customer entity.
     * Automatically generated using database identity column.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment strategy
    private Long id;

    /**
     * Customer's first name.
     */
    private String name;

    /**
     * Customer's last name.
     */
    private String surname;

    /**
     * Customer's email address. Should be unique in the system.
     */
    private String email;

    /**
     * Customer's phone number.
     */
    private int phoneNumber;

    /**
     * One-to-Many relationship with Post entities.
     * One customer can create multiple posts.
     * Cascade: Operations on customer will cascade to posts (e.g., delete customer → delete their posts)
     * mappedBy: Indicates the "customer" field in Post entity owns the relationship
     * JsonManagedReference: Prevents infinite recursion during JSON serialization
     */
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "customer")
    @JsonManagedReference(value = "customer-post")
    private List<Post> posts = new ArrayList<>();

    /**
     * One-to-Many relationship with Comment entities.
     * One customer can write multiple comments.
     * Cascade: Operations on customer will cascade to comments
     * mappedBy: Refers to "customerCom" field in Comment entity
     */
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "customerCom")
    @JsonManagedReference(value = "customer-comment")
    private List<Comment> comments = new ArrayList<>();

    /**
     * One-to-Many relationship with Like entities.
     * One customer can create multiple likes on posts and comments.
     * Cascade: Operations on customer will cascade to likes
     * mappedBy: Refers to "customer" field in Like entity
     */
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "customer")
    @JsonManagedReference(value = "customer_like")
    private List<Like> likes = new ArrayList<>();
}
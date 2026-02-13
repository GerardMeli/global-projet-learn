package com.example.blogpersonal.blogpersonal.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity class representing a Comment on a Post.
 * Comments are user-generated responses to posts and can also receive likes.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Entity // Marks this class as a JPA entity
@NoArgsConstructor // Lombok: Generates no-argument constructor
@AllArgsConstructor // Lombok: Generates constructor with all arguments
@Getter // Lombok: Generates getters for all fields
@Setter // Lombok: Generates setters for all fields
public class Comment {

    /**
     * Primary key for the Comment entity.
     * Automatically generated using database identity column.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment strategy
    private Long id;

    /**
     * The actual text content of the comment.
     */
    private String description;

    /**
     * Many-to-One relationship with Post entity.
     * Many comments can belong to one post.
     * JoinColumn: Creates foreign key "post_id" referencing Post's "id"
     * JsonBackReference: Prevents infinite recursion during JSON serialization
     */
    @ManyToOne
    @JoinColumn(name = "post_id", referencedColumnName = "id")
    @JsonBackReference(value = "post-comment")
    private Post postCom;

    /**
     * Many-to-One relationship with Customer entity.
     * Many comments can be written by one customer.
     * JoinColumn: Creates foreign key "customer_id" referencing Customer's "id"
     */
    @ManyToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @JsonBackReference(value = "customer-comment")
    private Customer customerCom;

    /**
     * One-to-Many relationship with Like entities.
     * One comment can receive multiple likes.
     * mappedBy: Indicates the "comment" field in Like entity owns the relationship
     * Cascade: Operations on comment will cascade to its likes
     */
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "comment-like")
    private List<Like> likes = new ArrayList<>(); 
}
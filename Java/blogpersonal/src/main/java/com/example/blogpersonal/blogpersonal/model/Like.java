package com.example.blogpersonal.blogpersonal.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity class representing a Like on either a Post or a Comment.
 * Likes represent user engagement and can be placed on posts or comments.
 * Note: The table name is "likes" because "like" is a reserved SQL keyword.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Entity // Marks this class as a JPA entity
@Getter // Lombok: Generates getters for all fields
@Setter // Lombok: Generates setters for all fields
@NoArgsConstructor // Lombok: Generates no-argument constructor
@AllArgsConstructor // Lombok: Generates constructor with all arguments
@Table(name = "likes") // Specifies table name (avoids SQL keyword conflict)
public class Like {

    /**
     * Primary key for the Like entity.
     * Automatically generated using database identity column.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment strategy
    private Long id;

    /**
     * Boolean flag indicating whether the like is active.
     * Can be used for "unlike" functionality by setting to false.
     * Default value is false (unliked).
     */
    private boolean liked = false;

    /**
     * Many-to-One relationship with Post entity.
     * Many likes can be placed on one post.
     * JoinColumn: Creates foreign key "post_id" referencing Post's "id"
     * JsonBackReference: Prevents infinite recursion during JSON serialization
     */
    @ManyToOne
    @JoinColumn(name = "post_id", referencedColumnName = "id")
    @JsonBackReference(value = "post-like")
    private Post post;

    /**
     * One-to-One relationship with Comment entity.
     * A like can be placed on one comment (if not on a post).
     * JoinColumn: Creates foreign key "comment_id" referencing Comment's "id"
     * Note: This design allows a like to be on EITHER a post OR a comment
     */
    @OneToOne
    @JoinColumn(name = "comment_id", referencedColumnName = "id")
    @JsonBackReference(value = "comment-like")
    private Comment comment; 

    /**
     * Many-to-One relationship with Customer entity.
     * Many likes can be created by one customer.
     * JoinColumn: Creates foreign key "customer_id" referencing Customer's "id"
     */
    @ManyToOne
    @JoinColumn(name = "customer_id")
    @JsonBackReference(value = "customer_like")
    private Customer customer;
}
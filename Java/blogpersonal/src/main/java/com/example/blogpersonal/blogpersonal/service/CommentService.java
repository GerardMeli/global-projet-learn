package com.example.blogpersonal.blogpersonal.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.blogpersonal.blogpersonal.model.Comment;
import com.example.blogpersonal.blogpersonal.repository.CommentRepository;

/**
 * Service class for handling business logic related to Comment entities.
 * This service layer acts as an intermediary between the controller and repository,
 * encapsulating business rules and data operations for comments.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Service // Marks this class as a Spring service component (business logic layer)
public class CommentService {

    /**
     * Repository for performing database operations on Comment entities.
     * Uses constructor injection for better testability and immutability.
     */
    @Autowired // Injects the CommentRepository dependency (optional with constructor injection)
    private final CommentRepository commentRepository;

    /**
     * Constructor for dependency injection of CommentRepository.
     * 
     * @param commentRepository The repository for comment data operations
     */
    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    /**
     * Saves a comment to the database.
     * Persists a new comment or updates an existing one if it already has an ID.
     * 
     * @param comm The Comment entity to be saved
     * @return The saved Comment entity with generated ID (if new) and timestamps
     * @apiNote This method handles both insert (new comment) and update (existing comment) operations
     */
    public Comment savedComment(Comment comm) {
        var com = commentRepository.save(comm); // Uses JpaRepository's save method
        return com;
    }

    /**
     * Retrieves all comments from the database.
     * Returns a complete list of all comments in the system.
     * 
     * @return List of all Comment entities, ordered by default repository ordering
     * @apiNote Consider adding pagination for better performance with large datasets
     */
    public List<Comment> findAllComment() {
        return commentRepository.findAll()
                .stream() // Convert to stream (optional in this case since findAll() already returns List)
                .collect(Collectors.toList()); // Convert stream back to List
    }

    /**
     * Finds a specific comment by its unique identifier.
     * 
     * @param id The unique identifier of the comment to retrieve
     * @return The Comment entity with the specified ID, or null if not found
     * @apiNote Returns null if comment not found - consider using Optional or throwing exception
     */
    public Comment findAllById(Long id) {
        return commentRepository.findById(id)
                    .orElse(null); // Returns null if no comment found with the given ID
    }

    /**
     * Deletes a comment by its unique identifier.
     * Removes the comment from the database permanently.
     * 
     * @param id The unique identifier of the comment to delete
     * @throws org.springframework.dao.EmptyResultDataAccessException if no comment exists with the given ID
     */
    public void deleteCommentById(Long id) {
        commentRepository.deleteById(id); // Throws exception if comment with ID doesn't exist
    }

    // Suggested additional methods for enhanced functionality:
    
    /**
     * Find all comments for a specific post.
     * Useful for displaying comments under a particular post.
     * 
     * @param postId The ID of the post to get comments for
     * @return List of comments belonging to the specified post
     */
    // public List<Comment> findCommentsByPostId(Long postId) {
    //     return commentRepository.findByPostComId(postId);
    // }
    
    /**
     * Find all comments by a specific customer.
     * Useful for showing a user's comment history.
     * 
     * @param customerId The ID of the customer who made the comments
     * @return List of comments made by the specified customer
     */
    // public List<Comment> findCommentsByCustomerId(Long customerId) {
    //     return commentRepository.findByCustomerComId(customerId);
    // }
}

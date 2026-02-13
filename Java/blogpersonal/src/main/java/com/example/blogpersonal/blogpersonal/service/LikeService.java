package com.example.blogpersonal.blogpersonal.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.blogpersonal.blogpersonal.model.Like;
import com.example.blogpersonal.blogpersonal.repository.LikeRepository;

/**
 * Service class for handling business logic related to Like entities.
 * Manages operations for liking/unliking posts and comments, and retrieving like information.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Service // Marks this class as a Spring service component
public class LikeService {

    /**
     * Repository for performing database operations on Like entities.
     */
    @Autowired // Optional with constructor injection
    private final LikeRepository likeRepository;

    /**
     * Constructor for dependency injection of LikeRepository.
     * 
     * @param likeRepository The repository for like data operations
     */
    public LikeService(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    /**
     * Saves a like to the database.
     * Used when a user likes a post or comment.
     * 
     * @param like The Like entity to be saved
     * @return The saved Like entity with generated ID and timestamps
     * @apiNote Consider adding validation to prevent duplicate likes
     */
    public Like savedLike(Like like) {
        var lik = likeRepository.save(like);
        return lik;
    }

    /**
     * Retrieves all likes from the database.
     * 
     * @return List of all Like entities in the system
     * @apiNote Consider adding filtering by post or comment for better performance
     */
    public List<Like> findAllLikes() {
        return likeRepository.findAll()
                    .stream() // Redundant stream operation
                    .collect(Collectors.toList()); // Redundant conversion
        // Simplified version: return likeRepository.findAll();
    }

    /**
     * Finds a specific like by its unique identifier.
     * 
     * @param id The unique identifier of the like to retrieve
     * @return The Like entity with the specified ID, or null if not found
     */
    public Like findAllById(Long id) {
        return likeRepository.findById(id)
                    .orElse(null);
    }

    /**
     * Deletes a like by its unique identifier.
     * Used when a user unlikes a post or comment.
     * 
     * @param id The unique identifier of the like to delete
     */
    public void deleteLikeById(Long id) {
        likeRepository.deleteById(id);
    }
    
    // Suggested additional methods:
    
    /**
     * Get all likes for a specific post.
     * Useful for displaying like count and users who liked a post.
     * 
     * @param postId The ID of the post
     * @return List of likes for the specified post
     */
    // public List<Like> findLikesByPostId(Long postId) {
    //     return likeRepository.findByPostId(postId);
    // }
    
    /**
     * Check if a user has already liked a specific post.
     * Prevents duplicate likes from the same user.
     * 
     * @param userId The ID of the user
     * @param postId The ID of the post
     * @return true if user already liked the post, false otherwise
     */
    // public boolean hasUserLikedPost(Long userId, Long postId) {
    //     return likeRepository.existsByCustomerIdAndPostId(userId, postId);
    // }
    
    /**
     * Get like count for a specific post.
     * More efficient than loading all like entities.
     * 
     * @param postId The ID of the post
     * @return Number of likes for the post
     */
    // public long getLikeCountForPost(Long postId) {
    //     return likeRepository.countByPostId(postId);
    // }
}
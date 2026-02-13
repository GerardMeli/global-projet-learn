package com.example.blogpersonal.blogpersonal.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.blogpersonal.blogpersonal.model.Post;
import com.example.blogpersonal.blogpersonal.repository.PostRepository;

/**
 * Service class for handling business logic related to Post entities.
 * Manages operations for creating, retrieving, and deleting posts,
 * and handles business rules related to post management.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Service // Marks this class as a Spring service component
public class PostService {

    /**
     * Repository for performing database operations on Post entities.
     */
    @Autowired // Optional with constructor injection
    private final PostRepository postRepository;

    /**
     * Constructor for dependency injection of PostRepository.
     * 
     * @param postRepository The repository for post data operations
     */
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    /**
     * Saves a post to the database.
     * Used for both creating new posts and updating existing ones.
     * 
     * @param post The Post entity to be saved
     * @return The saved Post entity with generated ID and timestamps
     * @apiNote Consider adding validation for post content length, title, etc.
     */
    public Post savedPost(Post post) {
        var pos = postRepository.save(post);
        return pos;
    }

    /**
     * Retrieves all posts from the database.
     * 
     * @return List of all Post entities in the system
     * @apiNote Consider adding pagination or ordering by creation date
     */
    public List<Post> findAllPost() {
        return postRepository.findAll()
                .stream() // Redundant stream operation
                .collect(Collectors.toList()); // Redundant conversion
        // Simplified version: return postRepository.findAll();
    }

    /**
     * Finds a specific post by its unique identifier.
     * 
     * @param id The unique identifier of the post to retrieve
     * @return The Post entity with the specified ID, or null if not found
     * @apiNote Consider throwing PostNotFoundException instead of returning null
     */
    public Post findAllById(Long id) {
        return postRepository.findById(id)
                    .orElse(null);
    }

    /**
     * Deletes a post by its unique identifier.
     * Also deletes all associated comments and likes due to CascadeType.ALL.
     * 
     * @param id The unique identifier of the post to delete
     * @apiNote Cascading delete will remove all related comments and likes
     */
    public void deletePostById(Long id) {
        postRepository.deleteById(id);
    }

    // Suggested additional methods:
    
    /**
     * Find posts by title containing given text (search functionality).
     * 
     * @param title Part of the title to search for
     * @return List of posts whose titles contain the search text
     */
    // public List<Post> findPostsByTitleContaining(String title) {
    //     return postRepository.findByTitleContainingIgnoreCase(title);
    // }
    
    /**
     * Find all posts by a specific customer.
     * 
     * @param customerId The ID of the customer (author)
     * @return List of posts created by the specified customer
     */
    // public List<Post> findPostsByCustomerId(Long customerId) {
    //     return postRepository.findByCustomerId(customerId);
    // }
    
    /**
     * Get recent posts with pagination.
     * 
     * @param page Page number (0-based)
     * @param size Number of posts per page
     * @return Page of posts ordered by creation date (newest first)
     */
    // public Page<Post> findRecentPosts(int page, int size) {
    //     return postRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    // }
}

package com.example.blogpersonal.blogpersonal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.blogpersonal.blogpersonal.model.Post;

/**
 * Repository interface for Post entity.
 * Extends JpaRepository to inherit common CRUD operations and query methods.
 * This interface handles all database operations for Post entities.
 * 
 * Spring Data JPA automatically provides implementation at runtime.
 * Custom query methods can be defined following Spring Data JPA naming conventions.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
public interface PostRepository extends JpaRepository<Post, Long> {
    
    /**
     * Custom query method to find all posts by their title.
     * Spring Data JPA automatically implements this method based on method name.
     * Performs a case-sensitive exact match on the title field.
     * 
     * @param title The exact title to search for
     * @return List of Post entities with the specified title
     * @apiNote This performs exact match. Consider using containing/ignoreCase for flexible search.
     * @example Returns all posts with title "My First Post"
     */
    List<Post> findAllByTitle(String title);

    // Suggested additional methods for enhanced functionality:
    
    /**
     * Find posts by title containing the given string (partial match).
     * Useful for search functionality in the application.
     * 
     * @param title Part of the title to search for
     * @return List of Post entities whose titles contain the given string
     */
    // List<Post> findByTitleContainingIgnoreCase(String title);
    
    /**
     * Find all posts by a specific customer (author).
     * Useful for displaying a user's post history.
     * 
     * @param customer The customer (author) to search posts for
     * @return List of Post entities created by the specified customer
     */
    // List<Post> findByCustomer(Customer customer);
    
    /**
     * Find all posts by customer ID.
     * More efficient than passing the entire Customer object.
     * 
     * @param customerId The ID of the customer (author)
     * @return List of Post entities created by the customer with the given ID
     */
    // List<Post> findByCustomerId(Long customerId);
    
    /**
     * Find posts ordered by creation date (newest first).
     * Useful for displaying posts in chronological order.
     * 
     * @return List of Post entities ordered by creation date descending
     */
    // List<Post> findAllByOrderByCreatedAtDesc();
    
    /**
     * Find posts with pagination support.
     * Essential for handling large datasets efficiently.
     * 
     * @param pageable Pagination information (page number, page size, sorting)
     * @return Page of Post entities with pagination metadata
     */
    // Page<Post> findAll(Pageable pageable);
}
package com.example.blogpersonal.blogpersonal.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.blogpersonal.blogpersonal.model.Like;
import com.example.blogpersonal.blogpersonal.service.LikeService;

import lombok.Getter;

/**
 * REST Controller for handling like-related operations.
 * Provides endpoints for creating, retrieving, and deleting like records.
 * Like entities typically represent user interactions (likes) on posts or comments.
 * 
 * All endpoints are prefixed with "/like" as specified by the class-level @RequestMapping.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Getter
@RestController
@RequestMapping("/like") // Base path for all endpoints in this controller
public class LikeController {

    /**
     * Service layer dependency for handling like business logic and data operations.
     * Uses constructor injection for better testability and immutability.
     */
    private final LikeService likeService;

    /**
     * Constructor for dependency injection of LikeService.
     * Spring automatically injects the LikeService bean when creating this controller.
     * 
     * @param likeService The service layer component for like operations
     */
    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    /**
     * Endpoint to create a new like record.
     * Typically used when a user likes a post or comment.
     * The like object should contain references to both the user and the liked entity.
     * 
     * @param like Like object containing the data to be saved, extracted from the request body
     * @return The saved Like entity with generated ID and timestamps
     * @apiNote POST http://localhost:8080/like/addlik
     * @example {
     *   "userId": 1,
     *   "postId": 5,
     *   "createdAt": "2024-01-15T10:30:00"
     * }
     */
    @PostMapping("/addlik") // HTTP POST endpoint for adding new likes
    public Like addLike(
        @RequestBody Like like // Extracts and deserializes JSON request body into Like object
    ) {
        return likeService.savedLike(like);
    }

    /**
     * Endpoint to retrieve all like records from the system.
     * Returns a complete list of all likes across all posts/comments.
     * 
     * @return List of all Like entities in the system
     * @apiNote GET http://localhost:8080/like/display_like
     */
    @GetMapping("/display_like") // HTTP GET endpoint for retrieving all likes
    public List<Like> displayLike() {
        return likeService.findAllLikes();
    }

    /**
     * Endpoint to find a specific like by its unique identifier.
     * Useful for retrieving individual like records or verifying like existence.
     * 
     * @param id The unique identifier of the like to retrieve
     * @return The Like entity with the specified ID, or null if not found
     * @apiNote GET http://localhost:8080/like/find_like/123
     */
    @GetMapping("/find_like/{id}") // HTTP GET endpoint with path variable for like ID
    public Like getLikeById(
        @PathVariable Long id // Extracts the 'id' value from the URL path and maps to Long parameter
    ) {
        return likeService.findAllById(id);
    }

    /**
     * Endpoint to delete a like record by its unique identifier.
     * Typically used when a user unlikes a post or comment.
     * Returns HTTP 202 Accepted status upon successful deletion.
     * 
     * @param id The unique identifier of the like to be deleted
     * @apiNote DELETE http://localhost:8080/like/delete_like/123
     * @implNote The method returns void but sets HTTP status to 202 (Accepted) upon success
     */
    @DeleteMapping("/delete_like/{idlike}") // HTTP DELETE endpoint for removing likes
    @ResponseStatus(HttpStatus.ACCEPTED) // Returns 202 Accepted status instead of default 200 OK
    public void deleteLike(
        @PathVariable("idlike") Long id // Maps URL path variable 'idlike' to 'id' parameter
    ) {
        likeService.deleteLikeById(id);
    }
}

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

import com.example.blogpersonal.blogpersonal.model.Post;
import com.example.blogpersonal.blogpersonal.service.PostService;

import lombok.Getter;
/**
 * REST Controller for handling post-related operations.
 * Provides endpoints for creating, retrieving, and deleting blog/social media posts.
 * 
 * All endpoints are prefixed with "/post" as specified by the class-level @RequestMapping.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Getter
@RestController
@RequestMapping("/post") // Base path for all endpoints in this controller
public class PostController {

    /**
     * Service layer dependency for handling post business logic and data operations.
     * Uses constructor injection for better testability and immutability.
     */
    private final PostService postService;

    /**
     * Constructor for dependency injection of PostService.
     * Spring automatically injects the PostService bean when creating this controller.
     * 
     * @param postService The service layer component for post operations
     */
    public PostController(PostService postService) {
        this.postService = postService;
    }

    /**
     * Endpoint to create a new post.
     * Accepts post data in the request body and persists it to the database.
     * The post should typically contain title, content, and author information.
     * 
     * @param post Post object containing the data to be saved, extracted from the request body
     * @return The saved Post entity with generated ID and timestamps
     * @apiNote POST http://localhost:8080/post/addpos
     * @example {
     *   "title": "My First Post",
     *   "content": "This is the content of my post...",
     *   "author": { "id": 1 }
     * }
     */
    @PostMapping("/addpos") // HTTP POST endpoint for adding new posts
    public Post addPost(
        @RequestBody Post post // Extracts and deserializes JSON request body into Post object
    ) {
        return postService.savedPost(post);
    }

    /**
     * Endpoint to retrieve all posts from the system.
     * Returns a complete list of all posts, typically ordered by creation date (newest first).
     * 
     * @return List of all Post entities in the system
     * @apiNote GET http://localhost:8080/post/display_post
     */
    @GetMapping("/display_post") // HTTP GET endpoint for retrieving all posts
    public List<Post> displayPosts() {
        return postService.findAllPost();
    }

    /**
     * Endpoint to find a specific post by its unique identifier.
     * Useful for displaying individual post pages or editing existing posts.
     * 
     * @param id The unique identifier of the post to retrieve
     * @return The Post entity with the specified ID, or null if not found
     * @apiNote GET http://localhost:8080/post/find_post/123
     */
    @GetMapping("/find_post/{id}") // HTTP GET endpoint with path variable for post ID
    public Post getPostById(
        @PathVariable Long id // Extracts the 'id' value from the URL path and maps to Long parameter
    ) {
        return postService.findAllById(id);
    }

    /**
     * Endpoint to delete a post by its unique identifier.
     * Typically only allowed for post authors or administrators.
     * Returns HTTP 202 Accepted status upon successful deletion.
     * 
     * @param id The unique identifier of the post to be deleted
     * @apiNote DELETE http://localhost:8080/post/delete_post/123
     * @implNote The method returns void but sets HTTP status to 202 (Accepted) upon success
     */
    @DeleteMapping("/delete_post/{idpost}") // HTTP DELETE endpoint for removing posts
    @ResponseStatus(HttpStatus.ACCEPTED) // Returns 202 Accepted status instead of default 200 OK
    public void deletePost(
        @PathVariable("idpost") Long id // Maps URL path variable 'idpost' to 'id' parameter
    ) {
        postService.deletePostById(id);
    }
}
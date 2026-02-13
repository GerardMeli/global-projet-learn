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

import com.example.blogpersonal.blogpersonal.model.Comment;
import com.example.blogpersonal.blogpersonal.service.CommentService;

import lombok.Getter;

/**
 * REST Controller for handling comment-related operations
 * Provides endpoints for adding, retrieving, and deleting comments
 */
@Getter
@RequestMapping("/comment") // Base path for all endpoints in this controller
@RestController // Indicates this class is a REST controller that returns data directly
public class CommentController {

    private final CommentService commentService;

    /**
     * Constructor for dependency injection of CommentService
     * @param commentService The service layer for comment operations
     */
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * Endpoint to add a new comment
     * @param comm Comment object received in request body
     * @return The saved comment entity
     */
    @PostMapping("/addcom") // HTTP POST endpoint for adding comments
    public Comment commentAdd(
        @RequestBody Comment comm // Extracts comment data from request body
    ) {
        return commentService.savedComment(comm);
    }

    /**
     * Endpoint to retrieve all comments
     * @return List of all comments in the system
     */
    @GetMapping("/display_comment") // HTTP GET endpoint for retrieving all comments
    public List<Comment> displayComment() {
        return commentService.findAllComment();
    }

    /**
     * Endpoint to find a specific comment by its ID
     * @param id The ID of the comment to retrieve
     * @return The comment with the specified ID
     */
    @GetMapping("/find_comment/{id}") // HTTP GET endpoint with path variable
    public Comment getCommentById(
        @PathVariable Long id // Extracts ID from URL path
    ) {
        return commentService.findAllById(id);
    }

    /**
     * Endpoint to delete a comment by its ID
     * @param id The ID of the comment to delete
     */
    @DeleteMapping("/delete_comment/{idcomment}") // HTTP DELETE endpoint
    @ResponseStatus(HttpStatus.ACCEPTED) // Returns 202 Accepted status instead of 200 OK
    public void deleteComment(
        @PathVariable("idcomment") Long id // Extracts 'idcomment' from URL and maps to 'id' parameter
    ) {
        commentService.deleteCommentById(id);
    }
}
package com.example.blogpersonal.blogpersonal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.blogpersonal.blogpersonal.model.Customer;

/**
 * Repository interface for Customer entity.
 * Extends JpaRepository to inherit common CRUD operations and query methods.
 * This interface handles all database operations for Customer entities.
 * 
 * Spring Data JPA automatically provides implementation for this interface
 * at runtime, including custom query methods following naming conventions.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    /**
     * Custom query method to find all customers by their email address.
     * Spring Data JPA automatically implements this method based on method name.
     * The method name follows Spring Data JPA query derivation rules.
     * 
     * @param email The email address to search for (exact match)
     * @return List of Customer entities with the specified email address
     * @apiNote This performs a case-sensitive exact match query
     * @example Returns all customers with email "john@example.com"
     */
    List<Customer> findAllByEmail(String email);
    
    /**
     * Custom query method to find customers by their name.
     * Spring Data JPA automatically implements this method based on method name.
     * Typically performs a case-sensitive exact match on the name field.
     * 
     * @param name The name to search for (exact match)
     * @return List of Customer entities with the specified name
     * @apiNote Consider using findAllByNameContaining for partial matches
     * @example Returns all customers with name "John"
     */
    List<Customer> findCustomerByName(String name);

    // Suggested additional methods for enhanced functionality:
    
    /**
     * Find customers by name containing the given string (partial match).
     * Useful for search functionality where users type part of a name.
     * 
     * @param name Part of the name to search for
     * @return List of Customer entities whose names contain the given string
     */
    // List<Customer> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find a customer by email address (single result expected).
     * Useful for login or unique email validation.
     * 
     * @param email The email address to search for
     * @return Optional containing the Customer if found, empty otherwise
     */
    // Optional<Customer> findByEmail(String email);
    
    /**
     * Check if a customer with the given email already exists.
     * Useful for validation during registration.
     * 
     * @param email The email address to check
     * @return true if a customer with this email exists, false otherwise
     */
    // boolean existsByEmail(String email);
}

package com.example.blogpersonal.blogpersonal.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.blogpersonal.blogpersonal.model.Customer;
import com.example.blogpersonal.blogpersonal.repository.CustomerRepository;

/**
 * Service class for handling business logic related to Customer entities.
 * Contains business operations for customer management including CRUD operations
 * and custom business rules for customer-related functionality.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Service // Marks this class as a Spring service component
public class CustomerService {

    /**
     * Repository for performing database operations on Customer entities.
     */
    private final CustomerRepository customerRepository;

    /**
     * Constructor for dependency injection of CustomerRepository.
     * 
     * @param customerRepository The repository for customer data operations
     */
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /**
     * Saves a customer to the database.
     * Can be used for both creating new customers and updating existing ones.
     * 
     * @param customer The Customer entity to be saved
     * @return The saved Customer entity with generated ID and timestamps
     * @apiNote Consider adding validation logic (e.g., email uniqueness) before saving
     */
    public Customer savedCustomer(Customer customer) {
        var cust = customerRepository.save(customer);
        return cust;
    }

    /**
     * Retrieves all customers from the database.
     * 
     * @return List of all Customer entities in the system
     * @apiNote The stream and collect operations are redundant here since findAll() already returns List
     */
    public List<Customer> displayCustomer() {
        return customerRepository.findAll()
                            .stream() // Unnecessary conversion to stream
                            // .map(c)  .map is used to convert one object to another object
                            .collect(Collectors.toList()); // Convert back to List (redundant)
        // Simplified version: return customerRepository.findAll();
    }

    /**
     * Finds customers by their name (exact match).
     * 
     * @param name The name to search for (case-sensitive exact match)
     * @return List of Customer entities with the specified name
     * @apiNote Consider adding case-insensitive or partial match functionality
     */
    public List<Customer> findCustomerByName(String name) {
        return customerRepository.findCustomerByName(name)
                        .stream() // Unnecessary stream operation
                        .collect(Collectors.toList()); // Redundant conversion
        // Simplified version: return customerRepository.findCustomerByName(name);
    }

    /**
     * Finds a specific customer by their unique identifier.
     * 
     * @param id The unique identifier of the customer to retrieve
     * @return The Customer entity with the specified ID, or null if not found
     * @apiNote Consider throwing a custom exception instead of returning null
     */
    public Customer findCustomerById(Long id) {
        return customerRepository.findById(id)
                        .orElse(null); // Returns null if customer not found
    }

    /**
     * Deletes a customer by their unique identifier.
     * 
     * @param id The unique identifier of the customer to delete
     * @throws org.springframework.dao.EmptyResultDataAccessException if no customer exists with the given ID
     * @apiNote Consider adding checks for existing relationships before deletion
     */
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    // Suggested additional methods:
    
    /**
     * Find customer by email address.
     * Useful for login functionality or email verification.
     * 
     * @param email The email address to search for
     * @return Optional containing Customer if found
     */
    // public Optional<Customer> findCustomerByEmail(String email) {
    //     return customerRepository.findByEmail(email);
    // }
    
    /**
     * Check if email already exists in the system.
     * Useful for registration validation.
     * 
     * @param email The email to check
     * @return true if email exists, false otherwise
     */
    // public boolean emailExists(String email) {
    //     return customerRepository.existsByEmail(email);
    // }
}
package com.example.blogpersonal.blogpersonal.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.blogpersonal.blogpersonal.model.Customer;
import com.example.blogpersonal.blogpersonal.service.CustomerService;

import lombok.Getter;

/**
 * REST Controller for handling customer-related operations.
 * Provides endpoints for creating, retrieving, and deleting customer records.
 * 
 * All endpoints are prefixed with "/customer" as specified by the class-level @RequestMapping.
 * 
 * @author Your Name
 * @version 1.0
 * @since 2024
 */
@Getter
@RequestMapping("/customer") // Base path for all endpoints in this controller
@RestController // Indicates this class is a REST controller that returns data directly as JSON/XML
public class CustomerController {

    /**
     * Service layer dependency for handling customer business logic and data operations.
     * Uses constructor injection for better testability and immutability.
     */
    @Autowired
    private final CustomerService customerService;

    /**
     * Constructor for dependency injection of CustomerService.
     * Spring automatically injects the CustomerService bean when creating this controller.
     * 
     * @param customerService The service layer component for customer operations
     */
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    /**
     * Endpoint to create a new customer.
     * Accepts customer data in the request body and persists it to the database.
     * 
     * @param cust Customer object containing the data to be saved, extracted from the request body
     * @return The saved Customer entity with generated ID and timestamps
     * @apiNote POST http://localhost:8080/customer/addcust
     */
    @PostMapping("/addcust") // HTTP POST endpoint for adding new customers
    public Customer addCustomer(
        @RequestBody Customer cust // Extracts and deserializes JSON request body into Customer object
    ) {
        return customerService.savedCustomer(cust);
    }

    /**
     * Endpoint to retrieve all customers from the system.
     * Returns a complete list of all customer records.
     * 
     * @return List of all Customer entities in the system
     * @apiNote GET http://localhost:8080/customer/display_customer
     */
    @GetMapping("/display_customer") // HTTP GET endpoint for retrieving all customers
    public List<Customer> display() {
        return customerService.displayCustomer();
    }

    /**
     * Endpoint to find a specific customer by their unique identifier.
     * Uses path variable to capture the customer ID from the URL.
     * 
     * @param id The unique identifier of the customer to retrieve
     * @return The Customer entity with the specified ID, or null if not found
     * @apiNote GET http://localhost:8080/customer/find_customer/123
     */
    @GetMapping("/find_customer/{id}") // HTTP GET endpoint with path variable for customer ID
    public Customer getCustomerById(
        @PathVariable Long id // Extracts the 'id' value from the URL path and maps to Long parameter
    ) {
        return customerService.findCustomerById(id);
    }

    /**
     * Endpoint to find customers by their name (partial or full match).
     * Useful for search functionality where users want to find customers by name.
     * 
     * @param name The name (or partial name) to search for in customer records
     * @return List of Customer entities matching the given name criteria
     * @apiNote GET http://localhost:8080/customer/find/john
     */
    @GetMapping("/find/{customer_name}") // HTTP GET endpoint with path variable for customer name
    public List<Customer> getCustomersByName(
        @PathVariable("customer_name") String name // Maps URL path variable 'customer_name' to 'name' parameter
    ) {
        return customerService.findCustomerByName(name);
    }

    /**
     * Endpoint to delete a customer by their unique identifier.
     * Returns HTTP 202 Accepted status upon successful deletion.
     * 
     * @param id The unique identifier of the customer to be deleted
     * @apiNote DELETE http://localhost:8080/customer/delete_customer/123
     * @implNote The method returns void but sets HTTP status to 202 (Accepted) upon success
     */
    @DeleteMapping("/delete_customer/{idcustomer}") // HTTP DELETE endpoint for removing customers
    @ResponseStatus(HttpStatus.ACCEPTED) // Returns 202 Accepted status instead of default 200 OK
    public void deleteCustomer(
        @PathVariable("idcustomer") Long id // Maps URL path variable 'idcustomer' to 'id' parameter
    ) {
        customerService.deleteCustomer(id);
    }
}
package com.example.webScraping.controller

import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
/**
 * Controller for handling home page requests.
 * Manages user authentication state via cookies.
 */
@Controller
class HomeController {

    /**
     * Handles GET requests to /home endpoint.
     * Checks if user is logged in via cookie and returns appropriate view.
     *
     * @param http the HTTP servlet request containing cookies
     * @return the view name ("home" if authenticated, "login" otherwise)
     */
    @GetMapping("/home")
    fun getHome(http: HttpServletRequest): String {
        // Check if cookies exist
        http.cookies?.let { cookies ->
            // Iterate through cookies to find login cookie
            for (cookie in cookies) {
                if (cookie.name == "login" && cookie.value == "true") {
                    return "home"
                }
            }
        }
        // Return login page if not authenticated
        return "login"
    }
}
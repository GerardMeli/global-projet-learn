package com.example.webScraping.scheduler

import com.example.webScraping.model.StateStats
import com.example.webScraping.model.Users
import com.example.webScraping.repository.UserRepository
import com.example.webScraping.scraper.Scraper
import com.example.webScraping.services.EntityService
import jakarta.annotation.PostConstruct
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.io.IOException

/**
 * The Scheduler component.
 * Responsible for periodically scraping COVID-19 data and persisting it to the database.
 */
@Component
class Scheduler(
    /**
     * The Scraper instance for fetching COVID data from external sources.
     */
    private val scraper: Scraper,

    /**
     * The entity service for persisting COVID data.
     */
    private val entityService: EntityService
) {

    /**
     * Logger instance for this class.
     */
    private val logger: Logger = LoggerFactory.getLogger(Scheduler::class.java)

    /**
     * User repository for managing user data.
     */
    @Autowired
    private lateinit var userRepository: UserRepository

    companion object {
        /**
         * The constant for scheduling delay in milliseconds (1000 seconds).
         */
        const val THOUSAND_SECONDS = 1000000
    }

    /**
     * Schedules periodic scraping of COVID-19 data.
     * Runs at fixed intervals defined by THOUSAND_SECONDS.
     * Fetches state-wise COVID data and persists it if data is available.
     */
    @Scheduled(fixedDelay = THOUSAND_SECONDS.toLong())
    fun scheduleScraping() {
        var stateWiseData: MutableList<StateStats>? = null
        try {
            stateWiseData = scraper.getCovidData()
        } catch (e: IOException) {
            logger.error("Error occurred while scraping data", e)
        }

        if (!stateWiseData.isNullOrEmpty()) {
            entityService.persistCoronaData(stateWiseData)
        }
    }

    /**
     * Initialization method that runs after dependency injection.
     * Creates a default admin user in the database if one doesn't exist.
     */
    @PostConstruct
    fun init() {
        try {
            // Check if admin user already exists
            val existingUser = userRepository.findByUsernameAndPassword("admin", "admin")
            if (existingUser.isEmpty) {
                userRepository.save(Users(id = 0, username = "admin", password = "admin"))
                logger.info("Default admin user created")
            } else {
                logger.info("Admin user already exists with ID: ${existingUser.get().id}")
            }
        } catch (e: Exception) {
            logger.error("Error initializing admin user", e)
        }
    }
}
package com.example.webScraping.repository

import com.example.webScraping.model.Users
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.Optional

interface UserRepository : JpaRepository<Users, Long> {

//    @Query("SELECT u.id FROM Users u WHERE u.userName = :userName AND u.password = :password")
//    fun getIdForExistingUser(
//        @Param("userName") userName: String,
//        @Param("password") password: String
//    ): Long?

    fun findByUsernameAndPassword(username: String, password: String): Optional<Users>

}
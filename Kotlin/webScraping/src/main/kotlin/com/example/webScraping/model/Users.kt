package com.example.webScraping.model

import jakarta.persistence.*

@Entity
@Table(name = "users")
data class Users(

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long ,

    @Column(name = "name")
    val username: String ,

    @Column(name = "password")
    val password: String

)

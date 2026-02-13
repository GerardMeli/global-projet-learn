package com.example.JunitDemo

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.ObjectWriter
import org.hamcrest.Matchers.hasSize
import org.hamcrest.core.IsNull.notNullValue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class BookTest {

    lateinit var mockMvc: MockMvc

//    Jackson tools for JSON conversion
    val objectMapper: ObjectMapper = ObjectMapper()
    val objectWriter: ObjectWriter = objectMapper.writer()

    // Mock repository (no real DB calls)
    @Mock
    lateinit var bookRepository: BookRepository

    // Controller with mocked dependencies injected
    @InjectMocks
    lateinit var bookController: BookController

    // ----------------------
    // Test data
    // ----------------------
    private lateinit var BOOK_1: Book
    private lateinit var BOOK_2: Book
    private lateinit var BOOK_3: Book

    @BeforeEach
    fun setUp() {

        // Standalone MockMvc using manually created controller
        mockMvc = MockMvcBuilders
            .standaloneSetup(bookController)
            .build()

        BOOK_1 = Book(1L, "Atomic Habits", "How to build better habits", 5.0)
        BOOK_2 = Book(3L, "reli", "ygkjiu ug ivou@123", 15.02)
        BOOK_3 = Book(2L, "fhcvj guguigy fvtxuj yggucn b", "tyfgyujhctyy iufryxtuyb dfyiuhb u", 15.02)
    }

    @Test
    fun allTheBooks() {

        Mockito.`when`(bookRepository.findAll())
            .thenReturn(listOf(BOOK_1, BOOK_2, BOOK_3))

        mockMvc.perform(
            MockMvcRequestBuilders.get("/book")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(3)))
            .andExpect(jsonPath("$[2].title")
                .value("fhcvj guguigy fvtxuj yggucn b"))
            .andExpect(jsonPath("$[1].title")
                .value("reli"))
    }

    @Test
    fun bookById() {
        Mockito.`when`(bookRepository.findById(BOOK_1.id)).thenReturn(Optional.of(BOOK_1))

        mockMvc.perform(
            MockMvcRequestBuilders.get("/book/1")
                .contentType(MediaType.APPLICATION_JSON)
        )
            // Expect HTTP 200
            .andExpect(status().isOk)

            // Expect response is not null
            .andExpect(jsonPath("$", notNullValue()))

            // Expect the title matches BOOK_1
            .andExpect(jsonPath("$.title")
                .value("Atomic Habits"))
    }

    @Test
    fun createBook() {
        val book = Book(
            id = 4L,
            title = "Introduction to Kotlin",
            author = "Reil237",
            price = 535.00
        )

        Mockito.`when`(bookRepository.save(book)).thenReturn(book)

        val content: String = objectWriter.writeValueAsString(book)

        val mockBuilder : MockHttpServletRequestBuilder = MockMvcRequestBuilders.post("/book")
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(content)

        mockMvc.perform (mockBuilder)
            .andExpect (status().isOk)
            .andExpect(jsonPath("$", notNullValue()))
            .andExpect(jsonPath("$.title")
                .value("Introduction to Kotlin"))

    }

    @Test
    fun updatedBook() {
        val bookUpToDate = Book(
            id = 2L,
            title = "Introduction to Java/JavaScript",
            author = "Meli Gerard",
            price = 15.02
        )

        Mockito.`when`(bookRepository.findById(BOOK_3.id)).thenReturn(Optional.ofNullable(BOOK_3))
        Mockito.`when`(bookRepository.save(bookUpToDate)).thenReturn(bookUpToDate)

        val UpdatedContent: String = objectWriter.writeValueAsString(bookUpToDate)

        val mockBuilder : MockHttpServletRequestBuilder = MockMvcRequestBuilders.put("/book/${bookUpToDate.id}")
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(UpdatedContent)

        mockMvc.perform (mockBuilder)
            .andExpect (status().isOk)
            .andExpect(jsonPath("$", notNullValue()))
            .andExpect(jsonPath("$.title")
                .value("Introduction to Java/JavaScript"))
    }

    @Test
    fun contextLoadsSuccessfully() {
        // Simple test to ensure setup works
        assert(true)
    }

}

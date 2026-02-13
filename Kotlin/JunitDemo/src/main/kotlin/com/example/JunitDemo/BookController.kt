package com.example.JunitDemo

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RequestMapping("/book")
@RestController
class BookController (
    var bookRepository: BookRepository
){

    @GetMapping
    fun getAllBook(): List<Book>{
        return  bookRepository.findAll()
    }

    @GetMapping("/{id}")
    fun getBookById(@PathVariable id: Long): ResponseEntity<Book> {
        return bookRepository.findById(id)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())
    }

    @PostMapping
    fun createBook(@RequestBody book: Book): Book {
        return bookRepository.save(book)
    }

    @PutMapping("/{id}")
    fun updateBookRecord(
        @PathVariable id: Long,
        @RequestBody bookRecord: Book
    ): Book {
        val existingBookRecord = bookRepository.findById(id)
            .orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Book with ID: $id does not exist."
                )
            }

        return bookRepository.save(existingBookRecord.copy(
            title = bookRecord.title,
            author = bookRecord.author,
            price = bookRecord.price
        ))
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    fun deleteBook(@PathVariable id: Long) {
        bookRepository.deleteById(id)
    }


}
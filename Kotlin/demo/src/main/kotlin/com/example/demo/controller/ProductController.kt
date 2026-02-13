package com.example.demo.controller

import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus
import org.springframework.beans.factory.annotation.Autowired

import com.example.demo.service.ProductService
import com.example.demo.model.Product
import com.example.demo.dto.ProductDto
import com.example.demo.mapper.ProductMapper

@RestController
@RequestMapping("/api/products")
class ProductController @Autowired constructor(
    private val productService: ProductService
) {

    // ----------------------------
    // GET /api/products
    // Get all products
    // ----------------------------
    @GetMapping("/all/products")
    fun getAllProducts(): ResponseEntity<List<ProductDto>> {
        val products = productService.getAllProducts()
        return ResponseEntity.ok(products)
    }

    // ----------------------------
    // GET /api/products/{id}
    // Get product by ID
    // ----------------------------
    @GetMapping("/{id}")
    fun getProductById(@PathVariable id: Long): ResponseEntity<ProductDto> {
        val product = productService.getProductById(id)
        return ResponseEntity.ok(product)
    }

    // ----------------------------
    // POST /api/products
    // Create a new product
    // ----------------------------
    @PostMapping("/add/product")
    fun createProduct(@RequestBody dto: ProductDto): ResponseEntity<ProductDto> {
        val product = productService.createProduct(dto)
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductMapper.toDto(product)) // Convert before returning
    }

    // ----------------------------
    // PUT /api/products/{id}
    // Update an existing product
    // ----------------------------
    @PutMapping("/update/{id}")
    fun updateProduct(
        @PathVariable id: Long,
        @RequestBody dto: ProductDto
    ): ResponseEntity<ProductDto> {
        val updatedProduct = productService.updateProduct(id, dto)
        return ResponseEntity.ok(ProductMapper.toDto(updatedProduct)) // Convert here too
    }


    // ----------------------------
    // DELETE /api/products/{id}
    // Delete a product
    // ----------------------------
    @DeleteMapping("/delete/{id}")
    fun deleteProduct(@PathVariable id: Long): ResponseEntity<Void> {
        productService.deleteProduct(id)
        return ResponseEntity.noContent().build()
    }

    // ----------------------------
    // GET /api/products/search?name=xxx
    // Search products by name (case-insensitive)
    // ----------------------------
    @GetMapping("/search")
    fun searchProducts(@RequestParam name: String): ResponseEntity<List<ProductDto>> {
        val results = productService.searchByName(name)
        return ResponseEntity.ok(results)
    }
}

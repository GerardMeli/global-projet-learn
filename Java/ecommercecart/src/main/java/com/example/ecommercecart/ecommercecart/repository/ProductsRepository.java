package com.example.ecommercecart.ecommercecart.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ecommercecart.ecommercecart.model.Products;

public interface ProductsRepository extends JpaRepository<Products, Long> {

    List<Products> findProductsByName(String name);
    List<Products> findProductsByCategory(String category);
    
}

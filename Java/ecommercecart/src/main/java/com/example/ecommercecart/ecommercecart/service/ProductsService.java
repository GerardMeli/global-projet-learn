package com.example.ecommercecart.ecommercecart.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ecommercecart.ecommercecart.model.Products;
import com.example.ecommercecart.ecommercecart.repository.ProductsRepository;

import lombok.Getter;

@Service
@Getter
public class ProductsService {

    @Autowired
    private ProductsRepository productsRepository;

    public ProductsService(ProductsRepository productsRepository) {
        this.productsRepository = productsRepository;
    }

    public Products saveProducts(Products products) {
        var savedProduct = productsRepository.save(products);
        return savedProduct;
    }

    public Products getProductsById(long id) {
        var product = productsRepository.findById(id).orElse(null);
        return product;
    }

    public List<Products> getAllProducts() {
        var getAll = productsRepository.findAll();
        return getAll;
    }

    public void deleteProductsById(long id) {
        productsRepository.deleteById(id);
    }

    public List<Products> findProductsByName(String name) {
        var prodcutsName = productsRepository.findProductsByName(name);
        return prodcutsName;
    }

    public List<Products> FindByCategory(String category) {
        var productsCategory = productsRepository.findProductsByCategory(category);
        return productsCategory;
    }

    public Products updateProducts(Products products) {
        var updatedProducts = productsRepository.save(products);
        return updatedProducts;
    }

}

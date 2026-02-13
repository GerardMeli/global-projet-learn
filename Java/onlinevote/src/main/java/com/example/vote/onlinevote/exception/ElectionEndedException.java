package com.example.vote.onlinevote.exception;

public class ElectionEndedException extends RuntimeException {
    public ElectionEndedException(String message) {
        super(message);
    }
}
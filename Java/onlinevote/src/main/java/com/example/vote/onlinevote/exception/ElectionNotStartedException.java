package com.example.vote.onlinevote.exception;

public class ElectionNotStartedException extends RuntimeException {
    public ElectionNotStartedException(String message) {
        super(message);
    }
}

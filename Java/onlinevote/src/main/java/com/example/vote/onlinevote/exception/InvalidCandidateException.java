package com.example.vote.onlinevote.exception;

public class InvalidCandidateException extends RuntimeException {
    public InvalidCandidateException(String message) {
        super(message);
    }
}
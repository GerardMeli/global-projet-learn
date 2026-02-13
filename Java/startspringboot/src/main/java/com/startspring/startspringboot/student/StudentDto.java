package com.startspring.startspringboot.student;

import jakarta.validation.constraints.NotEmpty;

public record StudentDto(
        @NotEmpty
        String firsrName,
        @NotEmpty
        String lastName,
        String email,
        Integer schoolID) {
}

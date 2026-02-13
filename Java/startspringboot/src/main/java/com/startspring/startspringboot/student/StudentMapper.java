package com.startspring.startspringboot.student;

import com.startspring.startspringboot.school.School;
import org.springframework.stereotype.Service;

@Service
public class StudentMapper {

    public Student toStudents(StudentDto dto) {
        var student = new Student();
        student.setFirsrName(dto.firsrName());
        student.setLastName(dto.lastName());
        student.setEmail(dto.email());

        var school = new School();
        school.setId(dto.schoolID());

        student.setSchool(school);

        return student;
    }

    public StudentResponseDto toStudentResponseDto(Student student) {
        return new StudentResponseDto(
                student.getFirsrName(),
                student.getLastName(),
                student.getEmail()
        );
    }

}

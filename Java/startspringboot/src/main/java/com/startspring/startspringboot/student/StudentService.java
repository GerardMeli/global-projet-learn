package com.startspring.startspringboot.student;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    public StudentService(StudentRepository studentRepository, StudentMapper studentMapper) {
        this.studentRepository = studentRepository;
        this.studentMapper = studentMapper;
    }

    public StudentResponseDto saveStudent(StudentDto Dto) {
        var student = studentMapper.toStudents(Dto);
        var saveStudnet =  studentRepository.save(student);
        return studentMapper.toStudentResponseDto(saveStudnet);
    }

    public Student student (StudentDto Dto) {
        var student = studentMapper.toStudents(Dto);
        return studentRepository.save(student);
    }

    public List<StudentResponseDto> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(studentMapper::toStudentResponseDto)
                .collect(Collectors.toList());
    }

    public StudentResponseDto findStudentById(Integer id) {
        return studentRepository.findById(id)
                .map(studentMapper::toStudentResponseDto)
                .orElse(null); // Return a default student ("null") if not found
    }

    public List<StudentResponseDto> findStudentByName(String name) {
        return studentRepository.findAllByFirsrNameContaining(name)
                .stream()
                .map(studentMapper::toStudentResponseDto)
                .collect(Collectors.toList()); // Return a default student ("null") if not found
    }

    public void deleteStudentById(Integer studentId) {
        studentRepository.deleteById(studentId);
    }
}

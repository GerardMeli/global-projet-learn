package com.startspring.startspringboot.student;

import com.startspring.startspringboot.Order;
import com.startspring.startspringboot.OrderRecord;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/students")
    public Student post(@RequestBody StudentDto dto) {
        return studentService.student(dto);
    }

    @PostMapping("/student")
    public StudentResponseDto saveStudent(
            @Valid @RequestBody StudentDto Dto) {
        return this.studentService.saveStudent(Dto);
    }

    @GetMapping("/students")
    public List<StudentResponseDto> findAllStudent() {
        return studentService.getAllStudents();
    }

    @GetMapping("/students/{student-id}")
    public StudentResponseDto findStudentById(@PathVariable("student-id") Integer studentId) {
        return studentService.findStudentById(studentId);
    }

    @GetMapping("/students/search/{student-name}")
    public List<StudentResponseDto> findStudentByName(@PathVariable("student-name") String studentId) {
        return studentService.findStudentByName(studentId);
    }

    @DeleteMapping("/students/{student-id}")
    @ResponseStatus(HttpStatus.OK)
    public void delete(@PathVariable("student-id") Integer studentId) {
        studentService.deleteStudentById(studentId);
    }

    // @ExceptionHandler(MethodArgumentNotValidException.class)
    // public ResponseEntity<?> handleMethodArgumentNotValidException(
    //         MethodArgumentNotValidException esp
    // ) {
        
    // }














    @GetMapping("/hello1")
    public String sayHello() {
        return "Hello World from my first application";
    }

    @PostMapping("/post")
    public String post(
            @RequestBody String message
    ) {
        return "Hello post World from my first application " + message  ;
    }

    @PostMapping("/post-order")
    public String post(@RequestBody Order order) {
        return "Hello post World from my first application : " + order.toString()  ;
    }

    @PostMapping("/post-order-record")
    public String postRecord(@RequestBody OrderRecord order) {
        return "Hello post World from my first application : " + order.toString()  ;
    }
    // @ResponseStatus(HttpStatus.FORBIDDEN)
    /*public String sayHello2() {
        return "Hello World from my first application";
    }*/

    // http://localhost:8080/hello/Gerard
    @GetMapping("/hello/{userName}")
    public String pathVariable(
            @PathVariable String userName
            // @PathVariable use to extract the value contain into the URL
    ) {
        return "Hello World from my first application " + userName ;
    }

    // http://localhost:8080/hello/Gerard
    @GetMapping("/hello")
    public String paramVariable(
            @RequestParam("user-name") String userName,
            @RequestParam("user-lastname") String lastName
            // @RequestParam use to extract the value contain into the parameter int he URL
    ) {
        return "Hello World from my first application " + userName + "  " + lastName;
    }
}

package com.exemple;

import java.util.List;

import com.exemple.model.Student;
import com.exemple.servlet.DBUtil;

public class Main {
    
    public static void main(String[] args) {
        try {
            // 1. Test database connection
            System.out.println("Testing database connection...");
            DBUtil.testConnection();
            
            // 2. Add a sample student
            System.out.println("\nAdding a new student...");
            Student newStudent = new Student("Alice", "Smith", "alice@example.com", "Computer Science");
            DBUtil.addStudent(newStudent);
            System.out.println("Added: " + newStudent);
            
            // 3. List all students
            System.out.println("\nCurrent students:");
            List<Student> students = DBUtil.getAllStudents();
            for (Student s : students) {
                System.out.println(s);
            }
            
            // 4. Cleanup (optional)
            System.out.println("\nCleaning up...");
            DBUtil.deleteStudent(newStudent.getId());
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
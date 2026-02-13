package com.exemple.servlet;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.exemple.model.Student;
import java.sql.Statement;


public class DBUtil {
        // Database connection details
    private static final String URL = "jdbc:mysql://localhost:3306/university";
    private static final String USER = "root";
    private static final String PASSWORD = "Passwod1247!";
    
    // Initialize database connection
    private static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
    
    public static void testConnection() throws SQLException {
        try (Connection conn = getConnection()) {
            System.out.println("Database connection successful!");
        }
    }
    
    public static void addStudent(Student student) throws SQLException {
        String sql = "INSERT INTO students (first_name, last_name, email, major) VALUES (?, ?, ?, ?)";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, student.getFirstName());
            stmt.setString(2, student.getLastName());
            stmt.setString(3, student.getEmail());
            stmt.setString(4, student.getMajor());
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows == 0) {
                throw new SQLException("Creating student failed, no rows affected.");
            }
            
            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    student.setId(generatedKeys.getInt(1));
                } else {
                    throw new SQLException("Creating student failed, no ID obtained.");
                }
            }
        }
    }
    
    public static List<Student> getAllStudents() throws SQLException {
        List<Student> students = new ArrayList<>();
        String sql = "SELECT * FROM students ORDER BY last_name, first_name";
        
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Student student = new Student();
                student.setId(rs.getInt("id"));
                student.setFirstName(rs.getString("first_name"));
                student.setLastName(rs.getString("last_name"));
                student.setEmail(rs.getString("email"));
                student.setMajor(rs.getString("major"));
                students.add(student);
            }
        }
        return students;
    }
    
    public static void deleteStudent(int id) throws SQLException {
        String sql = "DELETE FROM students WHERE id = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
    }
    
    // Retrieve a student by ID
    // This method is used to fetch a specific student from the database based on their ID.    
    public static Student getStudentById(int id) throws SQLException {
        String sql = "SELECT * FROM students WHERE id = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Student student = new Student();
                    student.setId(rs.getInt("id"));
                    student.setFirstName(rs.getString("first_name"));
                    student.setLastName(rs.getString("last_name"));
                    student.setEmail(rs.getString("email"));
                    student.setMajor(rs.getString("major"));
                    return student;
                }
            }
        }
        return null;
    }
    
    public static void updateStudent(Student student) throws SQLException {
        String sql = "UPDATE students SET first_name = ?, last_name = ?, email = ?, major = ? WHERE id = ?";
        
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, student.getFirstName());
            stmt.setString(2, student.getLastName());
            stmt.setString(3, student.getEmail());
            stmt.setString(4, student.getMajor());
            stmt.setInt(5, student.getId());
            
            stmt.executeUpdate();
        }
    }

}
// Note: The database URL, user, and password should be configured according to your environment.
// 6. Gestion des erreurs et confirmation
// Message de confirmation : nous avons placé "msg" dans la session.
// Redirection : response.sendRedirect("students") ; (meilleure pratique Post/Redirect/Get).

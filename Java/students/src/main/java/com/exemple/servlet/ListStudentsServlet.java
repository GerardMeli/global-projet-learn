package com.exemple.servlet;

import com.exemple.model.Student;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@WebServlet(name = "ListStudentsServlet", urlPatterns = {"/students"})
public class ListStudentsServlet extends HttpServlet {
    // Use try-with-resources for proper resource management
    // Move connection details to a DBUtil class (recommended)
    private static final String JDBC_URL = "jdbc:mysql://localhost:3306/studentdb?useSSL=false&serverTimezone=UTC";
    private static final String JDBC_USER = "root";
    private static final String JDBC_PASSWORD = "password";
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        List<Student> students = new ArrayList<>();
        
        try (Connection conn = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement("SELECT id, first_name, last_name, email, major FROM students");
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                Student student = new Student();
                student.setId(rs.getInt("id"));
                student.setFirstName(rs.getString("first_name"));
                student.setLastName(rs.getString("last_name"));
                student.setEmail(rs.getString("email"));
                student.setMajor(rs.getString("major"));
                students.add(student);
            }
            
            request.setAttribute("students", students);
            
        } catch (SQLException ex) {
            // Log the error and set an error message
            ex.printStackTrace();
            request.setAttribute("errorMessage", "Could not retrieve student list: " + ex.getMessage());
        }
        
        // Forward to JSP
        request.getRequestDispatcher("/WEB-INF/views/students.jsp").forward(request, response);
    }
}
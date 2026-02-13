package com.exemple.servlet;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.*;

@WebServlet(name = "AddStudentServlet", urlPatterns = {"/add-student"})
public class AddStudentServlet extends HttpServlet {
    private static final String JDBC_URL = "jdbc:mysql://localhost:3306/studentdb";
    private static final String JDBC_USER = "root";
    private static final String JDBC_PASSWORD = "password";
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Récupération des paramètres
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String email = request.getParameter("email");
        String major = request.getParameter("major");
        
        // Validation
        if (firstName == null || firstName.isEmpty() || 
            lastName == null || lastName.isEmpty() ||
            email == null || email.isEmpty() || !email.contains("@") ||
            major == null || major.isEmpty()) {
            
            request.getSession().setAttribute("error", "Tous les champs sont obligatoires et l'email doit être valide");
            response.sendRedirect("add-student.jsp");
            return;
        }
        
        // Connexion DB et insertion
        try (Connection conn = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(
                 "INSERT INTO students (first_name, last_name, email, major) VALUES (?, ?, ?, ?)")) {
            
            stmt.setString(1, firstName);
            stmt.setString(2, lastName);
            stmt.setString(3, email);
            stmt.setString(4, major);
            
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                request.getSession().setAttribute("message", "Étudiant ajouté avec succès !");
            }
        } catch (SQLException ex) {
            throw new ServletException("Erreur d'accès à la base de données", ex);
        }
        
        response.sendRedirect("students");
    }
}

// target/students.war

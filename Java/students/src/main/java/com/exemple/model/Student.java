package com.exemple.model;

public class Student {

    // Classe représentant un étudiant
    private int id;
    private String firstName;
    private String lastName;
    private String email;
    private String major;
    
    // Constructeurs
    public Student() {}
    
    public Student(String firstName, String lastName, String email, String major) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.major = major;
    }
    
    // Getters et Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getMajor() {
        return major;
    }
    
    public void setMajor(String major) {
        this.major = major;
    }

    @Override
    public String toString() {
        return String.format("Student[id=%d, name=%s %s, email=%s, major=%s]", 
                id, firstName, lastName, email, major);
    }
}
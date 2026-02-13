package com.startspring.startspringboot.student;

import com.startspring.startspringboot.studentprofile.StudentProfile;
import com.startspring.startspringboot.school.School;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "T_STUDENT")
public class Student {

    @Id
    @GeneratedValue
    private Integer id;
    @Column(name = "c_name", length = 50)
    private String firsrName;
    private String lastName;
    @Column(unique = true)
    private String email;
    private int age;
    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL)
    private StudentProfile studentProfile;
    @ManyToOne
    @JoinColumn(name = "school_id")
    @JsonBackReference
    private School school;

    public Student(String firsrName, String lastName, int age, String email, School school) {
        this.firsrName = firsrName;
        this.lastName = lastName;
        this.age = age;
        this.email = email;
        this.school = school;
    }

    public Student() {

    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirsrName() {
        return firsrName;
    }

    public void setFirsrName(String firsrName) {
        this.firsrName = firsrName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public StudentProfile getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfile studentProfile) {
        this.studentProfile = studentProfile;
    }

    public School getSchool() {
        return school;
    }

    public void setSchool(School school) {
        this.school = school;
    }
}

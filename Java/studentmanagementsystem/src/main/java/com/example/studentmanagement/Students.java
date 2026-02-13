package com.example.studentmanagement;

public class Students {

    private int id;
    private String name;
    private String surname;
    private String email;
    private int phoneNumber;

    public Students(int id, String name, String surname, String email, int phoneNumber) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getsurname() {
        return surname;
    }

    public void setsurname(String surname) {
        this.surname = surname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(int phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @Override
    public String toString() {
        return "Students{" +
                " id = " + id +
                ", name = ' " + name + '\'' +
                ", surname = ' " + surname + '\'' +
                ", email = ' " + email + '\'' +
                ", phoneNumber = " + phoneNumber +
                '}';
    }

}

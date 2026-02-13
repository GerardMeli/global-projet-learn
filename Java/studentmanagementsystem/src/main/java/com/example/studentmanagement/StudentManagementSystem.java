package com.example.studentmanagement;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.Scanner;

public class StudentManagementSystem {

    Scanner scan = new Scanner(System.in);
    ArrayList<Students> studentsList = new ArrayList<Students>();
    File file = new File("students.txt");

    public void run() {

        int choice = 0;

        do {

            System.out.println("####### Welcome to my Student Mangement System #######");
            System.out.println("1. Add the students");
            System.out.println("2. Update the student by id");
            System.out.println("3. Display all students");
            System.out.println("4. Display the student by id");
            System.out.println("5. Delete student by id");
            System.out.println("6. Exit");
            System.out.println("######################################################");
            choice = scan.nextInt();
            scan.nextLine();
            
            switch (choice) {
                
                case 1:

                    addNewStudent();
                    
                    break;

                case 2:

                    updateStudentByID();

                    break;
                
                case 3:

                    readAllStudents();

                    break;
                
                case 4:

                    displayStudentByID();

                    break;
                case 5:

                    deleteStudentByID();

                    break;

                case 6: // EXIT
                    System.out.println("Exiting program. Goodbye!");
                    break;
            
                default:
                    break;
            }

        } while (choice != 5);
    
        scan.close();

    }


    public void addNewStudent() {

        System.out.println("Enter the student matricule:");
        int studentMatricule = scan.nextInt();
        scan.nextLine(); // Use this line only with the number

        System.out.println("Enter the student name:");
        String studentName = scan.nextLine();

        System.out.println("Enter the student surname:");
        String studentSurname = scan.nextLine();

        System.out.println("Enter the student email:");
        String studentEmail = scan.nextLine();

        System.out.println("Enter the student phone number:");
        int studentPhoneNumber = scan.nextInt();
        scan.nextLine();
                    
        Students students = new Students(studentMatricule, studentName, studentSurname, studentEmail, studentPhoneNumber);
        studentsList.add(students);

                    // ✅ Use try-with-resources for automatic resource management
                    try (
                            FileWriter storeStudent = new FileWriter("students.txt", true);
                            BufferedWriter bw = new BufferedWriter(storeStudent);
                            PrintWriter pw = new PrintWriter(bw)
                        ) {
                        
                        // ✅ Add proper formatting and newlines
                        pw.println("Student Matricule: " + students.getId());
                        pw.println("Student Name: " + students.getName());
                        pw.println("Student Surname: " + students.getsurname());
                        pw.println("Student Email: " + students.getEmail());
                        pw.println("Student Phone: " + students.getPhoneNumber());
                        pw.println("Saved at " + new Date());
                        pw.println("----------------------------------------");
                        
                        System.out.println("Successfully wrote to the file");
                        
                    } catch (IOException e) {
                        System.out.println("An error occurred: " + e.getMessage());
                        // e.printStackTrace(); // Optional: for detailed debugging
                    }

                    System.out.println("Successfull save");

    }

    public void updateStudentByID() {
        
        System.out.println("Enter the student ID that you want to update");
                    int studentUpdate = scan.nextInt();

                    for (Students students4 : studentsList) {
                        if (studentUpdate == students4.getId()) {
                            System.out.println("Enter the student matricule:");
                            int studentUpdatedMatricule = scan.nextInt();
                            students4.setId(studentUpdatedMatricule);
                             scan.nextLine();

                            System.out.println("Enter the student name:");
                            String studentUpdatedName = scan.nextLine();
                            students4.setName(studentUpdatedName);

                            System.out.println("Enter the student surname:");
                            String studentUpdatedSurname = scan.nextLine();
                            students4.setsurname(studentUpdatedSurname);

                            System.out.println("Enter the student email:");
                            String studentUpdatedEmail = scan.nextLine();
                            students4.setEmail(studentUpdatedEmail);

                            System.out.println("Enter the student phone number:");
                            int studentUpdatedPhoneNumber = scan.nextInt();
                            students4.setPhoneNumber(studentUpdatedPhoneNumber);
                             scan.nextLine();
                        }
                        // else {
                        //     System.out.println("Student not found");
                        // }
                    }

    }

    private void readAllStudents() {
        
        System.out.println("All the student in the system");

                    // for (Students student3 : studentsList) {

                    //     if (!studentsList.isEmpty()) {
                    //         System.out.println("The student matricule : " + student3.getId());
                    //         System.out.println("The student name : " + student3.getName());
                    //         System.out.println("The student surname : " + student3.getsurname());
                    //         System.out.println("The student email : " + student3.getEmail());
                    //         System.out.println("The student phone number : " + student3.getPhoneNumber());
                            
                    //     } 
                    // }

                    try (BufferedReader reader = new BufferedReader(new FileReader(file))) {

                        System.out.println("\n=== RAW FILE CONTENT ===");
                        String line;
                        while ((line = reader.readLine()) != null) {
                            System.out.println(line);
                        }

                    } catch (FileNotFoundException e) {
                        System.out.println("An error occurred: " + e.getMessage());
                        // e.printStackTrace(); // Optional: for detailed debugging
                    } catch (IOException e) {
                        System.out.println("An error occurred: " + e.getMessage());
                        // e.printStackTrace(); // Optional: for detailed debugging 
                    }

    }

    private void displayStudentByID() {

        System.out.println("Enter the student ID that you want to display");
                    int studentDisplaying = scan.nextInt();

                    for (Students student2 : studentsList) {
                        if (student2.getId() == studentDisplaying) {
                            System.out.println("The student matricule : " + student2.getId());
                            System.out.println("The student name : " + student2.getName());
                            System.out.println("The student surname : " + student2.getsurname());
                            System.out.println("The student email : " + student2.getEmail());
                            System.out.println("The student phone number : " + student2.getPhoneNumber());

                            System.out.println("Student displayed successfully");
                        }
                    }
                        // else {
                        //     System.out.println("Student not found");
                        // }
                    
    }

    private void deleteStudentByID() {
        
         System.out.println("Enter the student ID that you want to delete");
                    int studentDelete = scan.nextInt();

                    for (Students student1 : studentsList) {
                        if (student1.getId() == studentDelete) {
                            studentsList.remove(student1);
                            System.out.println("Student deleted successfully");
                        }
                    }


    }

}

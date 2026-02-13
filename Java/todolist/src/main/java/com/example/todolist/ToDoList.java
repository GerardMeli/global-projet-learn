package com.example.todolist;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class ToDoList {

    private int id;
    private String taskName;
    private String taskDescription;
    private LocalDateTime taskCreateAt;
    private boolean isComplet;

    Scanner scan = new Scanner(System.in);
    ArrayList<Task> operation = new ArrayList<>();
    File fileWriter = new File("todolist.txt");

    int choice = 0;

    public void run() throws IOException {
        System.out.println("Running the ToDoList application...");
        System.out.println("############################################");

        do {
            System.out.println("###### User Interface : ################");
            System.out.println("###### 1. Add a task ###################");
            System.out.println("###### 2. Delete a task ################");
            System.out.println("###### 3. View all tasks ###############");
            System.out.println("###### 4. Clear the tasks ##############");
            System.out.println("###### 5. Update a task ################");
            System.out.println("###### 6. Count the task in file #######");
            System.out.println("###### 7. Exit #########################");

            System.out.println("Enter the number between 1 to 7 to start the operation: ");
            choice = scan.nextInt();
            scan.nextLine();

            switch (choice) {
                case 1:
                    addTheTask();
                    break;

                case 2:
                    deleteTheTask();
                    break;

                case 3:
                    displayAllTheTasks();
                    break;

                case 4:
                    clearTheTasks("todolist.txt");
                    break;

                case 5:
                    updateTheTasks();
                    break;

                case 6:
                    allTasksInFiles();
                    break;

                case 7:
                    System.out.println("Exiting the application... Goodbye!");
                    break;
            
                default:
                    System.out.println("Invalid choice! Please try again later.");
                    break;
            }

        } while (choice != 6);
    }

    private void updateTheTasks() {
        // try {
        //     List<String> lines = Files.readAllLines(Paths.get("todolist.txt"));
        //     if (lines.isEmpty()) {
        //         System.out.println("The file is empty, no tasks to update.");
        //         return;                
        //     } else {
                
        //     }
            
        //     int lineCount = lines.size();
        //     System.out.println("Total lines: " + lineCount);
        // } catch (IOException e) {
        //     e.printStackTrace();
        // }

        System.out.println("Enter the id task to update: ");
        id = scan.nextInt();
        scan.nextLine();

        for (Task ts : operation) {
            if (ts.getId() == id) {
                System.out.println("Enter the new task name: ");
                String newTaskName = scan.nextLine();
                ts.setTaskName(newTaskName);

                System.out.println("Enter the new task description: ");
                String newTaskDescription = scan.nextLine();
                ts.setTaskDescripton(newTaskDescription);

                System.out.println("Is the task completed? (true/false): ");
                boolean newIsComplet = scan.nextBoolean();
                ts.setComplet(newIsComplet);

                System.out.println("The task is updated successfully!");
            } else {
                System.out.println("The task with id " + id + " is not found!");                
            }
        }
    }

    private void allTasksInFiles() {
        try {
            List<String> lines = Files.readAllLines(Paths.get("todolist.txt"));
            int lineCount = lines.size();
            System.out.println("Total lines: " + lineCount);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    public void clearTheTasks(String filePath) {

        operation.clear();
        System.out.println("All the tasks in the lists are cleared successfully!");

        try {
            // Completely empty the file
            Files.write(Paths.get(filePath), new byte[0]);
            System.out.println("All tasks cleared from file: " + filePath);
        } catch (IOException e) {
            System.err.println("Error clearing file: " + e.getMessage());
        }
    }

    private void displayAllTheTasks() throws IOException {
        System.out.println("Displaying all the tasks in the lists: ");
        if (operation.isEmpty()) {
            System.out.println("No tasks available!");
        } else {
            for (Task ts : operation) {
                System.out.println(ts);
            }
        }
        System.out.println("#######################################");

        System.out.println("Reading tasks from the file:");
        try (
            FileReader fReader = new FileReader(fileWriter);
            BufferedReader bReader = new BufferedReader(fReader);
        ) {
            String line;
            while ((line = bReader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void deleteTheTask() {
        System.out.println("Enter the id task to remove");
        int idTaskRemove = scan.nextInt();
        scan.nextLine();

        for (Task ts : operation) {
            if (ts.getId() == idTaskRemove) {
                operation.remove(ts);
                System.out.println("The task is removed successfully!");
                
            }  else {
                System.out.println("The task with id " + idTaskRemove + " is not found!");
            }
        }
    }

    public void addTheTask() throws IOException{
        System.out.println("Enter the task name: ");
        taskName = scan.nextLine();
        System.out.println("Enter the taks description:");
        taskDescription = scan.nextLine();
        taskCreateAt = LocalDateTime.now();
        isComplet = false;

        id = operation.size() + 1;
        Task task = new Task(id, taskName, taskDescription, taskCreateAt, isComplet);
        operation.add(task);
        System.out.println("Added is successfull!");

        try(
            FileWriter fWriter = new FileWriter("todolist.txt", true);
            BufferedWriter bWriter = new BufferedWriter(fWriter);
            PrintWriter pWriter = new PrintWriter(bWriter);
        ) {
            pWriter.println(task);
            pWriter.flush();
            pWriter.close();
            System.out.println("Writting to the file is successfull!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}

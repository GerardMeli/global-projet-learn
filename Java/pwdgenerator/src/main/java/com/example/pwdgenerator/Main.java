package com.example.pwdgenerator;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // System.out.println("Hello world!"); 

        Scanner scan = new Scanner(System.in);

        while (true) {
            System.out.println("Enter the lenght of your password: ");
            int item = scan.nextInt();

            PWDGenerator pwd = new PWDGenerator();
            pwd.generatePassword(item);
        }
    }
}
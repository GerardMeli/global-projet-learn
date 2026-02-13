package com.example.guessgame;

import java.util.Random;
import java.util.Scanner;

public class Game {

    public void start() {
        System.out.println("Welcome to the Guessing Game!");

        Scanner scanner = new Scanner(System.in);
        Integer attemptsLimited = 10;
        Integer attempts = 0;
        Random rand = new Random();

        int range = rand.nextInt(1, 100);

        while (attempts < 10) {

            System.out.println("Enter the number range 1 to 100");
            int Guess = scanner.nextInt();

            attempts++; //1. attempts = 1, 2. attempts = 2...
            attemptsLimited -= 1; //1. attemptsLimited = 9, 2. attemptsLimited = 8... 
            
            if (Guess > range) {
                System.out.println("Too high!! Decrease!!");
                System.out.println("You have again " + attemptsLimited + " attempts left !");
            }

            else if (Guess < range) {
                System.out.println("Too low!! Increase!!");
                System.out.println("You have again " + attemptsLimited + " attempts left !");
            }

            else if (Guess == range) {
                System.out.println("Congratulations!! You guessed it right!!");
                break;
            }

            if (attemptsLimited == 0) {
                System.out.println("You have exhausted all your attempts!! The correct number was " + range);
                break;
            }
        } 
        
        scanner.close();
    }

}

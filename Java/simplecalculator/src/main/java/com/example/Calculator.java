package com.example;

import java.util.Scanner;

public class Calculator {

    public void run() {

        while (true) {
         
            Scanner scan = new Scanner(System.in);
            System.out.println("Enter the first number");
            double firstNumber = scan.nextDouble();
            System.out.println("Enter the second number");
            double secondNumber = scan.nextDouble();
            System.out.println("Please enter your operation (+, -, *, /, %, 's' for sin, 'c' for cos, 't' for tan), 'q' to quit: ");
            char operation = scan.next().charAt(0);
            double Result;

            switch (operation) {
                case '+':
                    System.out.println("The result is : " + (Result = firstNumber + secondNumber));
                    break;

                case '-':
                    Result = firstNumber - secondNumber;
                    System.out.println("The result is : " + (Result = firstNumber - secondNumber));
                    break;

                case '*':
                    Result = firstNumber * secondNumber;
                    System.out.println("The result is : " + (Result = firstNumber * secondNumber));
                    break;

                case '/':
                    if (secondNumber == 0) {
                        System.out.println("Error: Division by zero(0) is not allowed.");
                        return;
                    }
                    else {
                        System.out.println("The result is : " + (Result = firstNumber / secondNumber));
                    }
                    break;

                case '%':
                    System.out.println("The result is : " + (Result = firstNumber % secondNumber));
                    break;

                case 's':
                    System.out.println("The result for sinus of first number is : " + (Result = Math.sin(firstNumber)));
                    System.out.println("The result for sinus of second number is : " + (Result = Math.sin(secondNumber)));
                    break;

                case 'c' :
                    System.out.println("The result for cosinus of first number is : " + (Result = Math.cos(firstNumber)));
                    System.out.println("The result for cosinus of second number is : " + (Result = Math.cos(secondNumber)));
                    break;

                case 't' :
                    System.out.println("The result for cosinus of first number is : " + (Result = Math.tan(firstNumber)));
                    System.out.println("The result for cosinus of second number is : " + (Result = Math.tan(secondNumber)));
                    break;

                case 'q' :
                    System.out.println("Exiting the calculator. Goodbye!");
                    return;
            
                default:
                    break;
            }   
        }
    }
}

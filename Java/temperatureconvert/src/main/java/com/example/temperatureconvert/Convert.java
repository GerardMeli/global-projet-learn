package com.example.temperatureconvert;

import java.util.Scanner;

public class Convert {

    private double celsus;
    private double kelvin;
    private double fahrenheit;

    public void start() {
        System.out.println("The application convert temperature ");
        System.out.println("------------------------------------");

        Scanner scan = new Scanner(System.in);

        int choice = 0;

        do {
            System.out.println("Enter the value in celsus: ");
            celsus = scan.nextDouble();
            // celsus = Double.parseDouble(System.console().readLine()); // Use this method if you don't want to use the scanner method
            System.out.println("Enter the value in kelvin: ");
            kelvin = scan.nextDouble();
            System.out.println("Enter the value in fahrenheit: ");
            fahrenheit = scan.nextDouble();

            System.out.println("User interface: Do your choise");
            System.out.println("--------------");
            System.out.println("1. Convert from celsus to kelvin");
            System.out.println("2. Convert from celsus to fahrenheit");
            System.out.println("3. Convert from kelvin to celsus");
            System.out.println("4. Convert from kelvin to fahrenheit");
            System.out.println("5. Convert from fahrenheit to kelvin");
            System.out.println("6. Convert from fahrenheit to celsus");
            System.out.println("7. Exit");
            System.out.println("--------------");
            choice = scan.nextInt();

            switch (choice) {
                case 1:
                    System.out.println("The value in kelvin is : " + (celsus + 273.15));
                    break;
                
                case 2:
                    System.out.println("The value in fahrenheit is : " + ((celsus * (9/5)) + 32));
                    break;
                    
                case 3:
                    System.out.println("The value in celsus is : " + (kelvin - 273.15));
                    break;

                case 4:
                    System.out.println("The value in fahrenheit is : " + ((kelvin * (9 / 5) - 273.15) + 32));
                    break;

                case 5:
                    System.out.println("The value in kelvin is : " + ((fahrenheit - 32) * (5 / 9 )) + 273.15);
                    break;

                case 6:
                    System.out.println("The value in celsus is : " + (fahrenheit - 32) * (5 / 9));
                    break;

                case 7:
                    System.out.println("Thank you for visiting");
                    return;
            
                default:
                    System.out.println("Invalid option");
                    break;
            }

        } while (choice != 4);
    }
}

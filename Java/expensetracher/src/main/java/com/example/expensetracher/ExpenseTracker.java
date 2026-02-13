package com.example.expensetracher;

import java.util.Scanner;

public class ExpenseTracker {

    Scanner scanner = new Scanner(System.in);
    Operations operations = new Operations();
    int choice;

    public void chart() {
        do {
            System.out.println("Application Menu...");
            System.out.println("1. Add Income");
            System.out.println("2. Add Expense");
            System.out.println("3. Display Incomes");
            System.out.println("4. Display Expenses");
            System.out.println("5. Display Balance");
            System.out.println("6. Exit");
            choice = scanner.nextInt();
            scanner.nextLine(); // Consume newline

            switch (choice) {
                case 1:
                    operations.addIncome();
                    break;

                case 2:
                    operations.addExpense();
                    break;

                case 3:
                    operations.displayAllIncomes();
                    break;

                case 4:
                    operations.displayAllExpenses();
                    break;

                case 5:
                    operations.displayBalance();
                    break;
            
                default:
                    System.out.println("Invalid option. Please try again!!");
                    break;
            }

        } while (choice != 6);
    }
    
}

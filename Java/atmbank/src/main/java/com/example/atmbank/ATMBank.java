package com.example.atmbank;

import java.util.ArrayList;
import java.util.Scanner;

public class ATMBank {

    private ArrayList<BankAccount> currentAccounts = new ArrayList<BankAccount>();
    private int firstChoice;
    private int secondChoice;
    // private MessageDigest md;

    Scanner scanner = new Scanner(System.in);


    public void start() {

        do {
            System.out.println("Welcome to the ATM Bank!");
            System.out.println("1. Add Account");
            System.out.println("2. Doing a financial transaction");
            System.out.println("3. Display all the accounts");
            System.out.println("4. Exit");

            firstChoice = scanner.nextInt();
            scanner.nextLine();  // Consume newline

            switch (firstChoice) {
                case 1:
                    addAccount();
                    break;
                case 2:
                    System.out.println("Withdrawing from an account");
                    System.out.println("Enter account number:");
                    Long accNum = scanner.nextLong();
                    scanner.nextLine();  // Consume newline
                    System.out.println("Enter account name:");
                    String accName = scanner.nextLine();
                    System.out.println("Enter account password:");
                    String accPwd = scanner.nextLine();

                    performTransaction(accNum, accName, accPwd);

                    break;

                case 3:
                    System.out.println("Displaying all the accounts:");
                    System.out.println("Current Accounts:");
                    for (BankAccount ba : currentAccounts) {
                        System.out.println("Account Number: " + ba.getAccountNumber());
                        System.out.println("Account Name: " + ba.getAccountName());
                        System.out.println("Account Balance: " + ba.getAccountBalance());
                        System.out.println("Account Currency: " + ba.getAccountCurrency());
                        System.out.println("Account Type: " + ba.getAccountType());
                        System.out.println("Account Status: " + ba.getAccountStatus());
                        System.out.println("---------------------------");
                    }
                
                case 4:
                    System.out.println("Thank you for using ATM Bank!");
                    break;
                default:
                    System.out.println("Invalid choice. Please try again.");
            }
        } while (firstChoice != 4);
    }

    private Boolean performTransaction(Long accNum, String accName, String accPwd) {

        if (!currentAccounts.isEmpty()) {
            for (BankAccount ba : currentAccounts) {
                if (
                    ba.getAccountNumber().equals(accNum) &&
                    ba.getAccountName().equalsIgnoreCase(accName) &&
                    ba.getAccountPassword().equalsIgnoreCase(accPwd)
                ) {            

                    System.out.println("Choose operation type (1. to withdraw or 2. to add)");
                    secondChoice = scanner.nextInt();

                    switch (secondChoice) {
                        case 1:
                            withdraw();
                            break;

                        case 2:
                            addMoney();
                            break;
                    
                        default:
                            break;
                    }
                } else {
                    System.out.println("Account not found or incorrect credentials.");
                }
            }
        } else {
            System.out.println("No current accounts available now. Account not found or incorrect credentials.");
        }
        return true;
    }

    public void addAccount() {

        System.out.println("Enter account number:");
        Long accountNumber = scanner.nextLong();
        scanner.nextLine();  // Consume newline

        System.out.println("Enter account name:");
        String accountName = scanner.nextLine();

        Double accountBalance;
        do {
            System.out.println("Enter account balance (must be non-negative):");
            accountBalance = scanner.nextDouble();
            scanner.nextLine();  // Consume newline

            // if (accountBalance < 0) {
            //     System.out.println("Account balance must be non-negative. Please try again.");
            // } else {
            //     break;
            // }        
        } while (accountBalance < 0);
        
        System.out.println("Enter account password:");
        String accountPassword = scanner.nextLine();

        System.out.println("Enter account currency:");
        String accountCurrency = scanner.nextLine();

        System.out.println("Enter account type (current/savings):");
        String accountType = scanner.nextLine();

        System.out.println("Enter account status (active/inactive):");
        String accountStatus = scanner.nextLine();

        BankAccount newAccount = new BankAccount(
                accountNumber,
                accountName,
                accountBalance,
                accountPassword,
                accountCurrency,
                accountType,
                accountStatus
        );

        currentAccounts.add(newAccount);

        System.out.println("Account added successfully!");
    }

    public void withdraw() {

        for (BankAccount ba : currentAccounts) {

            if (ba.getAccountStatus().equalsIgnoreCase("inactive")) {
                System.out.println("Cannot withdraw from an inactive account. Activate it and try again later.");
                return;
            } else {
                System.out.println("Please enter the amount to withdraw (the current is " + ba.getAccountCurrency() +"): ");
                double amountToWithdraw = scanner.nextDouble();
                scanner.nextLine();  // Consume newline

                if (ba.getAccountBalance() >= amountToWithdraw) {
                    ba.setAccountBalance(ba.getAccountBalance() - amountToWithdraw);
                    System.out.println("Withdrawal successful. New balance: " + ba.getAccountBalance());

                } else {
                    System.out.println("Insufficient funds.");
                }
            }
        }
    }

    public void addMoney() {

        for (BankAccount ba : currentAccounts) {
            if (ba.getAccountStatus().equalsIgnoreCase("inactive")) {
                System.out.println("Cannot add money to an inactive account. Activate it and try again later.");
                return;
            } else {
                System.out.println("Please enter the amount to add (the current is " + ba.getAccountCurrency() +"): ");
                double amountToAdd = scanner.nextDouble();
                scanner.nextLine();  // Consume newline

                ba.setAccountBalance(ba.getAccountBalance() + amountToAdd);
            }
        }
    }

}

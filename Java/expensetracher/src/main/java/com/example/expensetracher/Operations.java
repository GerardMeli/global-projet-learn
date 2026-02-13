package com.example.expensetracher;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtils;
import org.jfree.chart.JFreeChart;
import org.jfree.data.category.DefaultCategoryDataset;

public class Operations {

    private double amountIncome;
    private double amountExpense;
    private LocalDate date;
    private String description;
    private String type;
    private String source;

    private double Balance = 0;
    private double incomeBalance = 0;
    private double expenseBalance = 0;

    Scanner scan = new Scanner(System.in);
    List<Expense> expenses = new ArrayList<Expense>();
    List<Income> incomes = new ArrayList<Income>();

    public void addExpense() {
        System.out.println("Enter the amount to remove");
        amountExpense = scan.nextDouble();

        scan.nextLine();
        
        date = LocalDate.now();

        System.out.println("Enter the description");
        description = scan.nextLine(); 
        
        System.out.println("Enter the type of your expense");
        type = scan.nextLine();
        
        Expense exp = new Expense(amountExpense, date, description, type);

        expenses.add(exp);

        System.out.println("Successfully!");

        expenseBalance += amountExpense;

    }

    public void addIncome() {
        System.out.println("Enter the amount to add");
        amountIncome = scan.nextDouble();

        scan.nextLine();
        
        date = LocalDate.now();

        System.out.println("Enter the description");
        description = scan.nextLine(); 

        System.out.println("Enter the type of your incom");
        type = scan.nextLine();        

        System.out.println("Enter the source of income");
        source = scan.nextLine();

        Income inc = new Income(source, amountIncome, date, description, type);

        incomes.add(inc);

        System.out.println("Successfully!");

        incomeBalance += amountIncome;
    }

    public void displayAllIncomes() {
        for (Income come : incomes) {
            System.out.println("The incomes informations....");
            System.out.println("The amount : " + come.getAmount());
            System.out.println("The enter date : " + come.getDate());
            System.out.println("The description : " + come.getDescription());
            System.out.println("The source : " + come.getSource());
            System.out.println("The enter type : " + come.getType());
            System.out.println("###########################################");
        }
    }

    public void displayAllExpenses() {
        for (Expense pense : expenses) {
            System.out.println("The expenses informations....");
            System.out.println("The amount : " + pense.getAmount());
            System.out.println("The enter date : " + pense.getDate());
            System.out.println("The description : " + pense.getDescription());
            System.out.println("The enter type : " + pense.getType());
            System.out.println("###########################################");
        }
    }

    public void displayBalance() {
        Balance = incomeBalance - expenseBalance;
        System.out.println("The balance is : " + Balance);

        // Create the dataset
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        for (Income come : incomes) {
            dataset.addValue(come.getAmount(), "Income - " + come.getDescription(), come.getDate());
        }

        for (Expense pense : expenses) {
            dataset.addValue(pense.getAmount(), "Expense - " + pense.getDescription(), pense.getDate());
        }

        // Create the chart
        JFreeChart barChart = ChartFactory.createBarChart(
            "Monthly Incomes vs Expense",
            "Date",
            "Amount",
            dataset
        );

        // Save chart as PNG
        try {
            ChartUtils.saveChartAsPNG(new File("expensetracker.png"), barChart, 800, 800);
            System.out.println("Bar chart saved successfully!!");
        } catch (IOException e) {
            // TODO: handle exception
            System.out.println("Error to saving " + e.getMessage());
        }
    }
}

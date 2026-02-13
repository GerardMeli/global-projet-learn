package com.example.expensetracher;

import java.time.LocalDate;

public class Expense extends Amout {

    private String type;

    public Expense(double amount, LocalDate date, String description, String type) {
        super(amount, date, description);
        this.type = type;
    }

    public double getAmount() {
        return super.getAmount();
    }

    public LocalDate getDate() {
        return super.getDate();
    }

    public String getDescription() {
        return super.getDescription();
    }

    public String getType() {
        return type;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "Expense{" +
                "amount=" + amount +
                ", date=" + date +
                ", description='" + description + '\'' +
                ", type=" + type +
                '}';   
    }

}

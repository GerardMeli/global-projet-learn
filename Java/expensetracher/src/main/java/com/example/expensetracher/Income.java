package com.example.expensetracher;

import java.time.LocalDate;

public class Income extends Amout {

    private String source;
    private String type;

    public Income(String source, double amount, LocalDate date, String description, String type) {
        super(amount, date, description);
        this.source = source;
        this.type = type;
    }

    public String getSource() {
        return source;
    }

    public double getAmount() {
        return amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getDescription() {
        return description;
    }

    public String getType() {
        return type;
    }

    public void setSource(String source) {
        this.source = source;
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
        return "Income{" +
                "source='" + source + '\'' +
                ", amount=" + amount +
                ", date=" + date +
                ", description='" + description + '\'' +
                '}';
    }

}

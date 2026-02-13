package com.example.atmbank;

public class BankAccount {

    private Long accountNumber;
    private String accountName;
    private Double accountBalance;
    private String accountPassword;
    private String accountCurrency;
    private String accountType;
    private String accountStatus;

    public BankAccount(
            Long accountNumber, 
            String accountName, 
            Double accountBalance, 
            String accountPassword, 
            String accountCurrency, 
            String accountType, 
            String accountStatus
        ) {
        this.accountNumber = accountNumber;
        this.accountName = accountName;
        this.accountBalance = accountBalance;
        this.accountPassword = accountPassword;
        this.accountCurrency = accountCurrency;
        this.accountType = accountType;
        this.accountStatus = accountStatus;
    }

    public Long getAccountNumber() {
        return accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }

    public Double getAccountBalance() {
        return accountBalance;
    }

    public String getAccountPassword() {
        return accountPassword;
    }

    public String getAccountCurrency() {
        return accountCurrency;
    }

    public String getAccountType() {
        return accountType;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountBalance(Double accountBalance) {
        this.accountBalance = accountBalance;
    }

    public void setAccountPassword(String accountPassword) {
        this.accountPassword = accountPassword;
    }

    public void setAccountCurrency(String accountCurrency) {
        this.accountCurrency = accountCurrency;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

}

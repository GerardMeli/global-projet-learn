package com.example.pwdgenerator;

import java.util.Random;

public class PWDGenerator {

    Random rand = new Random();

    public void generatePassword(int i) {
        String chaString = "1234567890qbcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/*-+.!@#$%^&*()_{}";
        StringBuilder sb = new StringBuilder();
        for (int j = 0; j < i; j++) {
            int index = rand.nextInt(chaString.length());
            sb.append(chaString.charAt(index));
        }
        System.out.println("Generated Password: " + sb.toString());
    }
}

package com.example.qrcodegenetator;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // System.out.println("Hello world!");

        Scanner scan = new Scanner(System.in);
        String path = "qrcode.png";

        try {
            System.out.println("Enter your string to generate the QR Code");
            String data = scan.nextLine();

            QRCodeGenerator.generateQRCode(data, path);
            System.out.println("QR Code generated successfully!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
package com.example.chatapplicationclient;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.Scanner;

public class Main {

    private static final String SERVER_ADDRESS = "localhost";
    private static final int SERVER_PORT = 12345;

    public static void main(String[] args) {
        // System.out.println("Hello world!");

        try (Socket socket = new Socket(SERVER_ADDRESS, SERVER_PORT)) {
            System.out.println("Connect to chat server");

            // Start a thread for reading messages from server
            new Thread(new ReadHandler(socket)).start();

            // Handle writing messages to server
            handleUserInput(socket);

        } catch (UnknownHostException e) {
            System.out.println("Server not found: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("I/O error: " + e.getMessage());
        }

    }

    private static void handleUserInput(Socket socket) {
        try (
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            Scanner scan = new Scanner(System.in)
        ) {
            String userInput;
            while (true) {
                userInput = scan.nextLine();
                out.println(userInput);

                if (userInput.equalsIgnoreCase("/quit")) {
                    break;
                }
            }
        } catch (IOException e) {
            System.out.println("Error sending message: " + e.getMessage());
        }
    }
}
package com.example.chatapplication;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class ClientHandler implements Runnable {

    private Socket socket;
    private PrintWriter out;
    private BufferedReader in;
    private String clientName;

    public ClientHandler(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        try {
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            out = new PrintWriter(socket.getOutputStream(), true);

            // Get client name
            out.println("Enter your name: ");
            clientName = in.readLine();
            System.out.println(clientName + " has joined the chat!");

            String serverMessage = clientName + " has joined the chat!";
            ChatServer.broadcast(serverMessage, this);

            String clientMessage;
            while ((clientMessage = in.readLine()) != null) {

                if (clientMessage.equalsIgnoreCase("/quit")) {
                    break;
                }
                serverMessage = "[" + clientName + "];" + clientMessage;
                System.out.println(serverMessage);
                ChatServer.broadcast(serverMessage, this);
                
            }
        } catch (IOException e) {
            System.out.println("Error handling client: " + e.getMessage());
        } finally {
            try {
                if (socket != null) {
                    socket.close();
                }
            } catch (IOException e) {
                System.out.println("Couldn't close socket: " + e.getMessage());
                // TODO: handle exception
            }

            ChatServer.removeClient(this);
            String leaveMessage = clientName + " has left the chat.";
            System.out.println(leaveMessage);
            ChatServer.broadcast(leaveMessage, this);
        }
    }

    public void sendMessage(String message) {
        out.println(message);
    }

}

package com.example.chatapplication;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class ChatServer {

    private static Set<ClientHandler> clientHandlers = Collections.synchronizedSet(new HashSet<>());

    public static void broadcast(String serverMessage, ClientHandler excludeClient) {
        synchronized (clientHandlers) {
            for (ClientHandler cli : clientHandlers) {
                if (cli != excludeClient) {
                    cli.sendMessage(serverMessage);
                }
            }
        }
    }
    public static void removeClient(ClientHandler clientHandler) {
        clientHandlers.remove(clientHandler);
        System.out.println("Client disconnected. Total clients : " + clientHandlers.size());
    }

}

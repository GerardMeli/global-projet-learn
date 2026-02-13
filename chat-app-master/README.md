# Chat Application

This is a real-time chat application built with Spring Boot and WebSocket.

## Features

*   Real-time messaging between users.
*   User connect and disconnect notifications.
*   Simple and intuitive user interface.

## Technologies Used

*   **Backend:**
    *   Java 21
    *   Spring Boot 3
    *   Spring WebSocket for real-time communication
    *   Spring Data JPA for database interaction
    *   H2 Database for in-memory data storage
    *   Maven for dependency management
*   **Frontend:**
    *   Thymeleaf for server-side templating
    *   HTML5, CSS3, JavaScript
    *   StompJS for WebSocket communication

## How to Run

1.  **Prerequisites:**
    *   Java 21 or later
    *   Maven 3.2+

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/codingwitharmand/chat-app.git
    ```

3.  **Navigate to the project directory:**
    ```bash
    cd chat-app
    ```

4.  **Run the application using Maven:**
    ```bash
    ./mvnw spring-boot:run
    ```

5.  **Access the application:**
    Open your web browser and go to `http://localhost:8080`

## Project Structure

```
.
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── cwa
│   │   │           └── chatapp
│   │   │               ├── config
│   │   │               │   ├── WebSocketConfig.java
│   │   │               │   └── WebSocketEventListener.java
│   │   │               ├── controller
│   │   │               │   ├── ApiController.java
│   │   │               │   ├── ChatController.java
│   │   │               │   └── WebController.java
│   │   │               ├── entity
│   │   │               │   ├── Message.java
│   │   │               │   └── User.java
│   │   │               ├── repository
│   │   │               │   ├── MessageRepository.java
│   │   │               │   └── UserRepository.java
│   │   │               └── service
│   │   │                   ├── MessageService.java
│   │   │                   └── UserService.java
│   │   └── resources
│   │       ├── static
│   │       │   ├── css
│   │       │   │   └── chat.css
│   │       │   └── js
│   │       │       └── chat.js
│   │       └── templates
│   │           ├── chat.html
│   │           └── index.html
│   └── test
└── pom.xml
```

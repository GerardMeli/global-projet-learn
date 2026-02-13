'use strict';

let stompClient = null;
let currentUser = null;
let isConnected = false;
let unreadCount = 0;
let isWindowFocused = true;
let typingTimer = null;

const userData = document.getElementById('currentUser');
currentUser = {
    username: userData.dataset.username,
    avatarColor: userData.dataset.color
}

window.addEventListener('focus', () => {
    isWindowFocused = true;
    resetUnreadCount();
});

window.addEventListener('blur', () => {
    isWindowFocused = false;
});

function connect() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError)
}

function onError(error) {
    console.log('Could not connect to WebSocket server. Please refresh this page to try again!', error);
}

function onConnected() {
    console.log('Connection established!');
    isConnected = true;

    stompClient.subscribe('/topic/public', onMessageReceived);

    stompClient.send("/app/chat.addUser", {}, JSON.stringify({
        sender: {username: currentUser.username},
        type: 'JOIN'
    }));

    updateOnlineUsers();
}

function updateOnlineUsers() {
    fetch('/api/online-users')
        .then(response => response.json())
        .then(users => {
            const container = document.getElementById('onlineUsers');
            const count = document.getElementById('onlineCount');

            count.textContent = users.length;
            container.innerHTML = '';

            users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.classList.add('online-user');
                userElement.innerHTML = `
                    <div class="user-avatar" style="background-color: ${user.avatarColor}">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="flex-grow-1">
                        <div class="fw-bold">${user.username}</div>
                        <small class="text-muted">Online</small>
                    </div>
                    <div class="online-indicator"></div>
                `;
                container.appendChild(userElement);
            })
        })
        .catch(error => console.log('Could not fetch online users!', error));
}

function onMessageReceived(payload) {

    const message = JSON.parse(payload.body);

    if (message.type === 'JOIN') {
        console.log('User joined!');
        showSystemMessage(`${message.sender.username} joined the chat!`, 'user-plus');
        updateOnlineUsers();
    } else if (message.type === 'LEAVE') {
        console.log('User left!');
        showSystemMessage(`${message.sender.username} left the chat!`, 'user-minus');
        updateOnlineUsers();
    } else if (message.type === 'TYPING') {
        console.log('One user is typing...!');
        showTypingIndicator(message.sender.username);
    } else if (message.type === 'CHAT') {
        console.log('New chat message received!');
        hideTypingIndicator();
        showMessage(message);

        if (!isWindowFocused && message.sender.username !== currentUser.username) {
            showNotification(`New message from ${message.sender.username}!`);
            playNotificationSound();
            incrementUnreadCount();
        }
    }
}

function incrementUnreadCount() {
    unreadCount++;
    const badge = document.getElementById('unreadCount');
    badge.textContent = unreadCount;
    badge.style.display = 'inline-block';

    document.title = `(${unreadCount}) Chat Room`;
}

function resetUnreadCount() {
    unreadCount = 0;
    const badge = document.getElementById('unreadCount');
    badge.style.display = 'none';
    document.title = 'Chat Room';
}

function playNotificationSound() {
    const audio = document.getElementById('messageSound');
    if (audio) {
        audio.play();
    }
}

function showNotification(message) {
    const badge = document.getElementById('notificationBadge');
    const text = document.getElementById('notificationText');
    text.textContent = message;
    badge.style.display = 'block';

    setTimeout(() => {
        badge.style.display = 'none';
        text.textContent = '';
    }, 5000);
}

function showMessage(message) {
    const messageArea = document.getElementById('messageArea');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    if (message.sender.username === currentUser.username) {
        messageElement.classList.add('own');
    }

    const timestamp = new Date(message.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});

    messageElement.innerHTML = `
        <div class="message-avatar" style="background-color: ${message.sender.avatarColor}">
            ${message.sender.username.charAt(0).toUpperCase()}
        </div>
        <div class="message-content">
            <div class="message-bubble">
                ${message.sender.username !== currentUser.username ?
        `<div class="fw-bold mb-1">${message.sender.username}</div>` : ''}
                <div>${escapeHtml(message.content)}</div>
            </div>
            <div class="message-time">${timestamp}</div>
        </div>
    `;

    messageArea.appendChild(messageElement);
}

function escapeHtml(unsafe) {
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
}

function showTypingIndicator(username) {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.querySelector('.typing-user').textContent = `${username} is typing`;
    typingIndicator.style.display = 'flex';

    if (typingTimer) {
        clearTimeout(typingTimer);
    }

    typingTimer = setTimeout(() => {
        hideTypingIndicator();
    }, 2000);
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'none';
}

function showSystemMessage(message, icon) {
    const messageArea = document.getElementById('messageArea');
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    messageArea.appendChild(messageElement);
}

function handleTyping() {
    if (stompClient && isConnected) {
        stompClient.send("/app/chat.typing", {}, JSON.stringify({
            sender: {username: currentUser.username},
            type: 'TYPING'
        }));
    }
}

function sendMessage(event) {
    event.preventDefault();

    const messageContent = document.getElementById('messageInput').value.trim();
    if (messageContent && stompClient && isConnected && isWindowFocused) {
        const chatMessage = {
            sender: {username: currentUser.username},
            content: messageContent,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        document.getElementById('messageInput').value = '';
        hideTypingIndicator();
    }
}

function leaveChat() {
    if (stompClient && isConnected) {
        stompClient.disconnect();
    }
    window.location.href = '/';
}

document.getElementById('messageForm').addEventListener('submit', sendMessage);
document.getElementById('messageInput').addEventListener('input', handleTyping);

connect();

document.getElementById('messageInput').focus();
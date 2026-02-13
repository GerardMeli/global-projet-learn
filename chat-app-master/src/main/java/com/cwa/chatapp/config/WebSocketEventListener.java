package com.cwa.chatapp.config;

import com.cwa.chatapp.entity.Message;
import com.cwa.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Objects;

@Configuration
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final UserService userService;
    private final SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        var headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        var username = Objects.requireNonNull(headerAccessor.getSessionAttributes()).get("username").toString();

        if (Objects.nonNull(username)) {
            var user = userService.findByUsername(username);
            userService.setUserOffline(user);

            var leaveMessage = new Message();
            leaveMessage.setType(Message.MessageType.LEAVE);
            leaveMessage.setSender(user);

            messagingTemplate.convertAndSend("/topic/public", leaveMessage);
        }
    }
}

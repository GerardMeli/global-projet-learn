package com.cwa.chatapp.service;

import com.cwa.chatapp.entity.Message;
import com.cwa.chatapp.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderByTimestampAsc();
    }

    public List<Message> getRecentMessages() {
        return messageRepository.findTop50ByOrderByTimestampDesc();
    }
}

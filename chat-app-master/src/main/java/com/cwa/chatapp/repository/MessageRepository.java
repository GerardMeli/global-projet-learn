package com.cwa.chatapp.repository;

import com.cwa.chatapp.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findTop50ByOrderByTimestampDesc();
    List<Message> findAllByOrderByTimestampAsc();
}

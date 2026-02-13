package com.cwa.chatapp.service;

import com.cwa.chatapp.entity.User;
import com.cwa.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final String[] colors = {"#000000", "#0000FF", "#008000", "#008080", "#00FF00", "#00FFFF", "#FF0000", "#FF00FF", "#FFFF00"};

    public User createOrGetUser(String username) {
        var existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            var user = existingUser.get();
            user.setOnline(true);
            user.setLastSeen(LocalDateTime.now());

            return userRepository.save(user);
        }
        var randomColor = colors[new Random().nextInt(colors.length)];
        var newUser = new User(username, randomColor);
        newUser.setOnline(true);

        return userRepository.save(newUser);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public List<User> getOnlineUsers() {
        return userRepository.findByIsOnlineTrue();
    }

    public void setUserOffline(User user) {
        user.setOnline(false);
        userRepository.save(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}

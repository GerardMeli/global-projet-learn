package com.cwa.chatapp.controller;

import com.cwa.chatapp.service.MessageService;
import com.cwa.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Objects;

@Controller
@RequiredArgsConstructor
public class WebController {

    private final UserService userService;
    private final MessageService messageService;

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @PostMapping("/join")
    public String join(@RequestParam String username, RedirectAttributes redirectAttributes) {
        if (Objects.isNull(username) || username.trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Username cannot be empty!");
            return "redirect:/";
        }

        redirectAttributes.addFlashAttribute("username", username.trim());
        return "redirect:/chat?username=" + username;
    }

    @GetMapping("/chat")
    public String chat(@RequestParam("username") String username, Model model) {
        if (Objects.isNull(username) || username.trim().isEmpty()) {
            return "redirect:/";
        }

        var user = userService.createOrGetUser(username);
        var messages = messageService.getAllMessages();
        var onlineUsers = userService.getOnlineUsers();

        model.addAttribute("currentUser", user);
        model.addAttribute("messages", messages);
        model.addAttribute("onlineUsers", onlineUsers);

        return "chat";
    }
}

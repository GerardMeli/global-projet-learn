// package com.example.vote.onlinevote.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.mail.javamail.JavaMailSenderImpl;

// import java.util.Properties;

// @Configuration
// public class EmailConfig {

//     @Bean
//     public JavaMailSender javaMailSender() {
//         JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
//         mailSender.setHost("smtp.yourmailserver.com"); // e.g., smtp.gmail.com
//         mailSender.setPort(587);
//         mailSender.setUsername("your-email@example.com");
//         mailSender.setPassword("your-email-password");
        
//         Properties props = mailSender.getJavaMailProperties();
//         props.put("mail.transport.protocol", "smtp");
//         props.put("mail.smtp.auth", "true");
//         props.put("mail.smtp.starttls.enable", "true");
//         props.put("mail.debug", "true"); // Set to false in production
        
//         return mailSender;
//     }
// }
package com.example.vote.onlinevote.service;
// package com.example.vote.onlinevote.sevirce;

// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.mail.javamail.MimeMessageHelper;
// import org.springframework.stereotype.Service;
// import org.thymeleaf.TemplateEngine;
// import org.thymeleaf.context.Context;

// import com.example.vote.onlinevote.model.Voter;

// import jakarta.mail.MessagingException;

// // import javax.mail.MessagingException;
// // import javax.mail.internet.MimeMessage;
// import java.nio.charset.StandardCharsets;
// import java.util.UUID;

// @Service
// public class EmailServiceImpl implements EmailService {

//     private final JavaMailSender mailSender;
//     private final TemplateEngine templateEngine;

//     public EmailServiceImpl(JavaMailSender mailSender, TemplateEngine templateEngine) {
//         this.mailSender = mailSender;
//         this.templateEngine = templateEngine;
//     }

//     @Override
//     public void sendVerificationEmail(String to, String subject, String content) {
//         try {
//             jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
//             MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            
//             helper.setTo(to);
//             helper.setSubject(subject);
//             helper.setText(content);
//             helper.setFrom("no-reply@voter-system.com");
            
//             mailSender.send(message);
//         } catch (MessagingException e) {
//             throw new RuntimeException("Failed to send verification email", e);
//         }
//     }

//     // @Override
//     // public void sendHtmlEmail(String to, String subject, String htmlContent) {
//     //     try {
//     //         MimeMessage message = mailSender.createMimeMessage();
//     //         MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            
//     //         helper.setTo(to);
//     //         helper.setSubject(subject);
//     //         helper.setText(htmlContent, true);
//     //         helper.setFrom("no-reply@voter-system.com");
            
//     //         mailSender.send(message);
//     //     } catch (MailException e) {
//     //         throw new RuntimeException("Failed to send HTML email", e);
//     //     }
//     // }

//     public void sendVerificationEmailWithTemplate(Voter voter) {
//         Context context = new Context();
//         context.setVariable("voter", voter);
//         context.setVariable("verificationUrl", generateVerificationUrl(voter));
        
//         String htmlContent = templateEngine.process("email/verification-email", context);
//         sendHtmlEmail(voter.getEmail(), "Verify Your Voter Registration", htmlContent);
//     }

//     private String generateVerificationUrl(Voter voter) {
//         // Generate a unique verification token (you'll need to implement this)
//         String token = generateVerificationToken(voter);
//         return "https://yourdomain.com/verify?token=" + token;
//     }

//     private String generateVerificationToken(Voter voter) {
//         // Implement token generation logic here
//         // This could use JWT or a simple UUID
//         return UUID.randomUUID().toString();
//     }

//     @Override
//     public void sendHtmlEmail(String to, String subject, String htmlContent) {
//         // TODO Auto-generated method stub
//         throw new UnsupportedOperationException("Unimplemented method 'sendHtmlEmail'");
//     }
// }
package com.dkpilot.backend.service;

import com.dkpilot.backend.dto.EmailRequest;
import com.dkpilot.backend.entity.EmailHistory;
import com.dkpilot.backend.repository.EmailHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailHistoryRepository emailHistoryRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(
            JavaMailSender mailSender,
            EmailHistoryRepository emailHistoryRepository
    ) {
        this.mailSender = mailSender;
        this.emailHistoryRepository = emailHistoryRepository;
    }

    public void sendEmail(EmailRequest request) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(request.getTo());
        message.setSubject(request.getSubject());
        message.setText(request.getBody());

        mailSender.send(message);

        EmailHistory history = new EmailHistory();

        history.setToEmail(request.getTo());
        history.setSubject(request.getSubject());
        history.setContent(request.getBody());
        history.setSentDate(LocalDateTime.now());

        // Ippo temporary-a sender email save pannrom.
        // JWT integration next step-la current logged-in user email save pannuvom.
        history.setUserEmail(fromEmail);

        emailHistoryRepository.save(history);
    }
}
package com.dkpilot.backend.controller;

import com.dkpilot.backend.dto.EmailRequest;
import com.dkpilot.backend.entity.EmailHistory;
import com.dkpilot.backend.repository.EmailHistoryRepository;
import com.dkpilot.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "http://localhost:5173")
public class EmailController {

    private final EmailService emailService;
    private final EmailHistoryRepository emailHistoryRepository;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailController(
            EmailService emailService,
            EmailHistoryRepository emailHistoryRepository
    ) {
        this.emailService = emailService;
        this.emailHistoryRepository = emailHistoryRepository;
    }

    @PostMapping("/send")
    public String sendEmail(@RequestBody EmailRequest request) {
        emailService.sendEmail(request);
        return "Email Sent Successfully";
    }

    @GetMapping("/history")
    public List<EmailHistory> getEmailHistory() {
        return emailHistoryRepository
                .findByUserEmailOrderBySentDateDesc(senderEmail);
    }
}
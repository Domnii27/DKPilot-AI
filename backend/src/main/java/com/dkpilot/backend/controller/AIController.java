package com.dkpilot.backend.controller;

import com.dkpilot.backend.dto.AIRequest;
import com.dkpilot.backend.entity.AIChatHistory;
import com.dkpilot.backend.repository.AIChatHistoryRepository;
import com.dkpilot.backend.service.OpenAIService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    @Autowired
    private OpenAIService openAIService;

    @Autowired
    private AIChatHistoryRepository aiChatHistoryRepository;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody AIRequest aiRequest,
            Authentication authentication
    ) {

        Map<String, String> response = new HashMap<>();

        if (authentication == null) {
            response.put(
                    "message",
                    "User is not authenticated"
            );

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        if (
                aiRequest.getMessage() == null ||
                aiRequest.getMessage().trim().isEmpty()
        ) {
            response.put(
                    "message",
                    "Message cannot be empty"
            );

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }

        String userEmail = authentication.getName();

        String userMessage =
                aiRequest.getMessage().trim();

        String answer =
                openAIService.generateResponse(
                        userMessage
                );

        AIChatHistory chatHistory =
                new AIChatHistory(
                        userMessage,
                        answer,
                        LocalDateTime.now(),
                        userEmail
                );

        aiChatHistoryRepository.save(chatHistory);

        response.put("answer", answer);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<AIChatHistory>> getChatHistory(
            Authentication authentication
    ) {

        if (authentication == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        String userEmail = authentication.getName();

        List<AIChatHistory> chatHistory =
                aiChatHistoryRepository
                        .findByUserEmailOrderByCreatedDateDesc(
                                userEmail
                        );

        return ResponseEntity.ok(chatHistory);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Map<String, String>> deleteChatHistory(
            @PathVariable Long id,
            Authentication authentication
    ) {

        Map<String, String> response = new HashMap<>();

        if (authentication == null) {
            response.put(
                    "message",
                    "User is not authenticated"
            );

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        AIChatHistory chatHistory =
                aiChatHistoryRepository
                        .findById(id)
                        .orElse(null);

        if (chatHistory == null) {
            response.put(
                    "message",
                    "Chat history not found"
            );

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(response);
        }

        String loggedInUserEmail =
                authentication.getName();

        if (
                !chatHistory
                        .getUserEmail()
                        .equals(loggedInUserEmail)
        ) {
            response.put(
                    "message",
                    "You are not authorized to delete this chat"
            );

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(response);
        }

        aiChatHistoryRepository.delete(chatHistory);

        response.put(
                "message",
                "Chat deleted successfully"
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> clearChatHistory(
            Authentication authentication
    ) {

        Map<String, String> response = new HashMap<>();

        if (authentication == null) {
            response.put(
                    "message",
                    "User is not authenticated"
            );

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        String userEmail = authentication.getName();

        List<AIChatHistory> chatHistory =
                aiChatHistoryRepository
                        .findByUserEmailOrderByCreatedDateDesc(
                                userEmail
                        );

        aiChatHistoryRepository.deleteAll(chatHistory);

        response.put(
                "message",
                "All chat history cleared successfully"
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/invoice")
    public Map<String, String> generateInvoiceDetails(
            @RequestBody AIRequest aiRequest
    ) {

        String prompt = """
                Extract invoice details from the user's message.

                Return only valid JSON in this exact format:
                {
                  "clientName": "",
                  "clientEmail": "",
                  "itemDescription": "",
                  "amount": 0,
                  "gstPercentage": 0
                }

                Rules:
                1. Do not add markdown.
                2. Do not add explanations.
                3. If client email is not provided, keep it empty.
                4. Amount and GST must be numbers.
                5. User message:
                """ + aiRequest.getMessage();

        String answer =
                openAIService.generateResponse(prompt);

        Map<String, String> response =
                new HashMap<>();

        response.put("answer", answer);

        return response;
    }
}
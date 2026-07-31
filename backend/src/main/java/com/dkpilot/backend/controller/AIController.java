package com.dkpilot.backend.controller;

import com.dkpilot.backend.dto.AIRequest;
import com.dkpilot.backend.service.OpenAIService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    @Autowired
    private OpenAIService openAIService;

    @PostMapping("/chat")
    public Map<String, String> chat(
            @RequestBody AIRequest aiRequest) {

        String answer = openAIService.generateResponse(
                aiRequest.getMessage()
        );

        Map<String, String> response = new HashMap<>();
        response.put("answer", answer);

        return response;
    }

    @PostMapping("/invoice")
    public Map<String, String> generateInvoiceDetails(
            @RequestBody AIRequest aiRequest) {

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

        String answer = openAIService.generateResponse(prompt);

        Map<String, String> response = new HashMap<>();
        response.put("answer", answer);

        return response;
    }
}
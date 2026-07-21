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
}
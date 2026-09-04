package com.dkpilot.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public OpenAIService(
            @Value("${groq.api.key}") String groqApiKey,
            ObjectMapper objectMapper) {

        this.objectMapper = objectMapper;

        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + groqApiKey
                )
                .defaultHeader(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();
    }

    public String generateResponse(String userMessage) {

        Map<String, Object> systemMessage = Map.of(
                "role", "system",
                "content",
                "You are DKPilot AI, a helpful business automation assistant. "
                        + "Give clear, professional, and concise answers."
        );

        Map<String, Object> userMessageBody = Map.of(
                "role", "user",
                "content", userMessage
        );

        Map<String, Object> requestBody = Map.of(
                 "model", "openai/gpt-oss-120b",
                "messages", List.of(
                        systemMessage,
                        userMessageBody
                ),
                "temperature", 0.5,
                "max_completion_tokens", 1000
        );

        try {
            String response = restClient
                    .post()
                    .uri("/chat/completions")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return extractAnswer(response);

        } catch (Exception exception) {

            System.out.println(
                    "Groq API Error: " + exception.getMessage()
            );

            return "AI response generate panna mudiyala. "
                    + "Groq API key and internet connection check pannunga.";
        }
    }

    private String extractAnswer(String responseJson) {

        try {
            JsonNode root = objectMapper.readTree(responseJson);

            return root
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText();

        } catch (Exception exception) {

            System.out.println(
                    "Groq response parsing error: "
                            + exception.getMessage()
            );

            return "AI response read panna mudiyala.";
        }
    }
}
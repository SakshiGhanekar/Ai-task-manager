package com.taskmanagement.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.backend.controller.dto.AiGenerateResponse;
import com.taskmanagement.backend.controller.dto.AiChatResponse;
import com.taskmanagement.backend.entity.Priority;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiGenerateResponse generateTaskDetails(String title) {
        try {
            String prompt = String.format(
                    "Analyze this task title: \"%s\".\n" +
                    "Generate a short description, suggest a priority (LOW, MEDIUM, HIGH), provide an estimated completion time string (e.g., \"2 Hours\"), and a raw integer for estimatedHours.\n" +
                    "Return ONLY a valid JSON object (without markdown code blocks) in this format:\n" +
                    "{\n" +
                    "  \"description\": \"...\",\n" +
                    "  \"priority\": \"HIGH\",\n" +
                    "  \"estimatedTime\": \"...\",\n" +
                    "  \"estimatedHours\": 2\n" +
                    "}", title);

            String requestBody = "{"
                    + "\"contents\": [{"
                    + "\"parts\": [{\"text\": \"" + prompt.replace("\"", "\\\"").replace("\n", "\\n") + "\"}]"
                    + "}]"
                    + "}";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            String responseString = restTemplate.postForObject(url, request, String.class);

            JsonNode root = objectMapper.readTree(responseString);
            String aiText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            // Clean up if it contains markdown code blocks
            aiText = aiText.replaceAll("```json", "").replaceAll("```", "").trim();

            AiGenerateResponse response = objectMapper.readValue(aiText, AiGenerateResponse.class);
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed AI generation. Using smart fallback.");
            
            // Smart Local Fallback Algorithm (used when API key is missing or invalid)
            String lowerTitle = title.toLowerCase();
            Priority priority = Priority.MEDIUM;
            String estTime = "2 Hours";
            int estHours = 2;
            String description = "Analyze, design, and implement the necessary changes for: " + title + ".\n\n" +
                               "Key responsibilities include:\n" +
                               "- Reviewing current architecture and identifying integration points.\n" +
                               "- Developing robust and scalable code to meet the requirements.\n" +
                               "- Writing unit tests and ensuring QA standards are met.\n" +
                               "- Deploying the changes and monitoring for performance impact.";

            if (lowerTitle.contains("bug") || lowerTitle.contains("fix") || lowerTitle.contains("urgent") || lowerTitle.contains("error")) {
                priority = Priority.HIGH;
                estTime = "4 Hours";
                estHours = 4;
                description = "CRITICAL HOTFIX: " + title + ".\n\n" +
                              "Immediate action required to resolve this issue. Steps:\n" +
                              "1. Reproduce the bug in the local environment.\n" +
                              "2. Identify the root cause within the affected modules.\n" +
                              "3. Implement a patch and run regression testing.\n" +
                              "4. Push to production immediately upon passing tests.";
            } else if (lowerTitle.contains("api") || lowerTitle.contains("backend") || lowerTitle.contains("database") || lowerTitle.contains("schema")) {
                priority = Priority.HIGH;
                estTime = "8 Hours";
                estHours = 8;
                description = "BACKEND ENGINEERING TASK: " + title + ".\n\n" +
                              "This task requires deep backend architectural work.\n" +
                              "- Update REST endpoints and ensure secure data transmission.\n" +
                              "- Modify database schemas using proper migration scripts.\n" +
                              "- Optimize query performance and implement necessary caching mechanisms.\n" +
                              "- Update API documentation (Swagger/OpenAPI).";
            } else if (lowerTitle.contains("design") || lowerTitle.contains("ui") || lowerTitle.contains("frontend") || lowerTitle.contains("css") || lowerTitle.contains("page")) {
                priority = Priority.MEDIUM;
                estTime = "6 Hours";
                estHours = 6;
                description = "FRONTEND & UI IMPLEMENTATION: " + title + ".\n\n" +
                              "Focus on delivering a pixel-perfect, responsive user interface.\n" +
                              "- Translate Figma/design mockups into reusable React components.\n" +
                              "- Ensure cross-browser compatibility and mobile responsiveness.\n" +
                              "- Implement smooth animations and transitions.\n" +
                              "- Connect UI components to Redux/Context state or backend APIs.";
            } else if (lowerTitle.contains("test") || lowerTitle.contains("qa") || lowerTitle.contains("docs") || lowerTitle.contains("update")) {
                priority = Priority.LOW;
                estTime = "1 Hour";
                estHours = 1;
                description = "MAINTENANCE & QUALITY ASSURANCE: " + title + ".\n\n" +
                              "- Review existing documentation and update out-of-date sections.\n" +
                              "- Add comprehensive unit and integration tests.\n" +
                              "- Perform code reviews and run automated linting tools.\n" +
                              "- Ensure all project standards are fully met.";
            }

            return AiGenerateResponse.builder()
                    .description(description)
                    .priority(priority)
                    .estimatedTime(estTime)
                    .estimatedHours(estHours)
                    .build();
        }
    }

    public AiChatResponse chat(String message) {
        try {
            String requestBody = "{"
                    + "\"contents\": [{"
                    + "\"parts\": [{\"text\": \"" + message.replace("\"", "\\\"").replace("\n", "\\n") + "\"}]"
                    + "}]"
                    + "}";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            String responseString = restTemplate.postForObject(url, request, String.class);

            JsonNode root = objectMapper.readTree(responseString);
            String aiText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            return AiChatResponse.builder().response(aiText).build();

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Gemini Error: " + e.getMessage());
            System.err.println("Failed AI chat generation. Using conversational fallback.");
            
            // Smart Conversational Fallback when API key is missing or invalid
            String lowerMessage = message.toLowerCase();
            String fallbackResponse;
            
            if (lowerMessage.contains("hello") || lowerMessage.contains("hi ")) {
                fallbackResponse = "Hello! I am Nexus AI. I'm currently running in limited offline mode because my Gemini API key is not configured. How can I help you today?";
            } else if (lowerMessage.contains("who are you") || lowerMessage.contains("what are you")) {
                fallbackResponse = "I am Nexus AI, an advanced productivity partner built to help you manage tasks and streamline workflows. Please configure my backend API key to unlock my full potential!";
            } else if (lowerMessage.contains("error") || lowerMessage.contains("bug")) {
                fallbackResponse = "It looks like you're talking about an issue. I can help debug that once my full Gemini API access is restored. For now, please check the console logs or stack trace for clues!";
            } else {
                fallbackResponse = "I'm currently running in an offline fallback mode because my API key is not set up correctly in the backend properties. \n\nHowever, I hear you asking about: **\"" + message + "\"**.\n\nPlease update `gemini.api.key` in your `application.properties` to connect me to the real Gemini AI!";
            }

            return AiChatResponse.builder().response(fallbackResponse).build();
        }
    }
}

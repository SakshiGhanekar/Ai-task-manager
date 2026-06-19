package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.controller.dto.AiGenerateRequest;
import com.taskmanagement.backend.controller.dto.AiGenerateResponse;
import com.taskmanagement.backend.controller.dto.AiChatRequest;
import com.taskmanagement.backend.controller.dto.AiChatResponse;
import com.taskmanagement.backend.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/generate")
    public ResponseEntity<AiGenerateResponse> generateTaskDetails(
            @Valid @RequestBody AiGenerateRequest request
    ) {
        return ResponseEntity.ok(aiService.generateTaskDetails(request.getTitle()));
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(
            @Valid @RequestBody AiChatRequest request
    ) {
        return ResponseEntity.ok(aiService.chat(request.getMessage()));
    }
}

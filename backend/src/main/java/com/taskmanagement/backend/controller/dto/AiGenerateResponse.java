package com.taskmanagement.backend.controller.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.taskmanagement.backend.entity.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiGenerateResponse {
    private String description;
    private Priority priority;
    private String estimatedTime;
    private Integer estimatedHours;
}

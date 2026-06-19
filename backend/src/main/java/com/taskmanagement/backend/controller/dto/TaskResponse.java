package com.taskmanagement.backend.controller.dto;

import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private Status status;
    private LocalDate dueDate;
    private String estimatedTime;
    private Integer estimatedHours;
    private Integer completedHours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

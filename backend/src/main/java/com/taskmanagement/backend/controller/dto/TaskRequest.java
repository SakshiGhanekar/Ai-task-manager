package com.taskmanagement.backend.controller.dto;

import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotNull(message = "Status is required")
    private Status status;

    private LocalDateTime dueDate;

    private String estimatedTime;
    
    private Integer estimatedHours;
    
    private Integer completedHours;
}

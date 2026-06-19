package com.taskmanagement.backend.service;

import com.taskmanagement.backend.controller.dto.DashboardStatsResponse;
import com.taskmanagement.backend.controller.dto.TaskRequest;
import com.taskmanagement.backend.controller.dto.TaskResponse;
import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.Status;
import com.taskmanagement.backend.entity.Task;
import com.taskmanagement.backend.entity.User;
import com.taskmanagement.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public Page<TaskResponse> getTasks(User user, Status status, Priority priority, String search, Pageable pageable) {
        Page<Task> tasks = taskRepository.findByUserWithFilters(user, status, priority, search, pageable);
        return tasks.map(this::mapToResponse);
    }

    public TaskResponse createTask(User user, TaskRequest request) {
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus())
                .dueDate(request.getDueDate())
                .estimatedTime(request.getEstimatedTime())
                .estimatedHours(request.getEstimatedHours())
                .completedHours(request.getCompletedHours() != null ? request.getCompletedHours() : 0)
                .user(user)
                .build();
        return mapToResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(User user, Long taskId, TaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Task not found or unauthorized"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setEstimatedTime(request.getEstimatedTime());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setCompletedHours(request.getCompletedHours() != null ? request.getCompletedHours() : 0);

        return mapToResponse(taskRepository.save(task));
    }

    public void deleteTask(User user, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Task not found or unauthorized"));
        taskRepository.delete(task);
    }

    public DashboardStatsResponse getStats(User user) {
        long total = taskRepository.countByUser(user);
        long completed = taskRepository.countByUserAndStatus(user, Status.DONE);
        long pending = taskRepository.countByUserAndStatus(user, Status.TODO);
        long inProgress = taskRepository.countByUserAndStatus(user, Status.IN_PROGRESS);
        long highPriority = taskRepository.countByUserAndPriority(user, Priority.HIGH);

        return DashboardStatsResponse.builder()
                .totalTasks(total)
                .completedTasks(completed)
                .pendingTasks(pending)
                .inProgressTasks(inProgress)
                .highPriorityTasks(highPriority)
                .build();
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .estimatedTime(task.getEstimatedTime())
                .estimatedHours(task.getEstimatedHours())
                .completedHours(task.getCompletedHours())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}

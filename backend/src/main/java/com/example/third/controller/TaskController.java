package com.example.third.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.third.model.Task;
import com.example.third.service.TaskService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    // Constructor Injection (best practice)
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Get all tasks (ordered by creation date newest first)
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // Get completed tasks
    @GetMapping("/completed")
    public ResponseEntity<List<Task>> getCompletedTasks() {
        return ResponseEntity.ok(taskService.getCompletedTasks());
    }

    // Get pending tasks
    @GetMapping("/pending")
    public ResponseEntity<List<Task>> getPendingTasks() {
        return ResponseEntity.ok(taskService.getPendingTasks());
    }

    // Get task by ID
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    // Create a new task (validation enforced)
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        Task createdTask = taskService.createTask(task);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    // Update a task (validation enforced)
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody Task taskDetails) {
        Task updatedTask = taskService.updateTask(id, taskDetails);
        return ResponseEntity.ok(updatedTask);
    }

    // Mark task as completed (set completed = true)
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Task> markTaskCompleted(@PathVariable Long id) {
        Task updatedTask = taskService.markTaskCompleted(id);
        return ResponseEntity.ok(updatedTask);
    }

    // Toggle task status
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTaskStatus(@PathVariable Long id) {
        Task updatedTask = taskService.toggleTaskStatus(id);
        return ResponseEntity.ok(updatedTask);
    }

    // Delete a task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}

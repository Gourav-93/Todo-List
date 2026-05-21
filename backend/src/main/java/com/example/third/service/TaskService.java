package com.example.third.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.third.model.Task;
import com.example.third.repository.TaskRepository;
import com.example.third.exception.TaskNotFoundException;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    // Constructor Injection (best practice)
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Task> getCompletedTasks() {
        return taskRepository.findByCompletedTrueOrderByCreatedAtDesc();
    }

    public List<Task> getPendingTasks() {
        return taskRepository.findByCompletedFalseOrderByCreatedAtDesc();
    }

    public Task getTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }

    public Task createTask(Task task) {
        task.setCompleted(false); // Force false on creation as per feature requirement
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task taskDetails) {
        Task task = getTask(id);
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        return taskRepository.save(task);
    }

    public Task toggleTaskStatus(Long id) {
        Task task = getTask(id);
        task.setCompleted(!task.isCompleted());
        return taskRepository.save(task);
    }

    public Task markTaskCompleted(Long id) {
        Task task = getTask(id);
        task.setCompleted(true);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        Task task = getTask(id);
        taskRepository.delete(task);
    }
}

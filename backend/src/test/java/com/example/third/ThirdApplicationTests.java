package com.example.third;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.third.model.Task;
import com.example.third.repository.TaskRepository;
import com.example.third.service.TaskService;
import com.example.third.exception.TaskNotFoundException;

@ExtendWith(MockitoExtension.class)
class ThirdApplicationTests {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private Task sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = new Task("Test Title", "Test Description");
        sampleTask.setId(1L);
    }

    @Test
    void shouldGetAllTasks() {
        when(taskRepository.findAllByOrderByCreatedAtDesc()).thenReturn(Arrays.asList(sampleTask));

        List<Task> tasks = taskService.getAllTasks();

        assertNotNull(tasks);
        assertEquals(1, tasks.size());
        assertEquals("Test Title", tasks.get(0).getTitle());
        verify(taskRepository, times(1)).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void shouldGetTaskByIdSuccessfully() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));

        Task task = taskService.getTask(1L);

        assertNotNull(task);
        assertEquals(1L, task.getId());
        assertEquals("Test Title", task.getTitle());
    }

    @Test
    void shouldThrowExceptionWhenTaskNotFound() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(TaskNotFoundException.class, () -> taskService.getTask(99L));
    }

    @Test
    void shouldCreateTaskWithCompletedFalse() {
        Task inputTask = new Task("New Task", "New Description");
        inputTask.setCompleted(true); // Attempt to set to true

        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task createdTask = taskService.createTask(inputTask);

        assertNotNull(createdTask);
        assertFalse(createdTask.isCompleted(), "Created task should be pending by default");
        assertEquals("New Task", createdTask.getTitle());
    }

    @Test
    void shouldToggleTaskStatus() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // First toggle: false -> true
        Task toggled1 = taskService.toggleTaskStatus(1L);
        assertTrue(toggled1.isCompleted());

        // Second toggle: true -> false
        Task toggled2 = taskService.toggleTaskStatus(1L);
        assertFalse(toggled2.isCompleted());
    }

    @Test
    void shouldMarkTaskAsCompleted() {
        sampleTask.setCompleted(false);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task completedTask = taskService.markTaskCompleted(1L);

        assertTrue(completedTask.isCompleted());
    }

    @Test
    void shouldDeleteTaskSuccessfully() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        doNothing().when(taskRepository).delete(any(Task.class));

        taskService.deleteTask(1L);

        verify(taskRepository, times(1)).delete(sampleTask);
    }
}

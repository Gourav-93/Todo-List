package com.example.third;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.example.third.model.Task;
import com.example.third.repository.TaskRepository;

@SpringBootApplication
public class ThirdApplication {

    public static void main(String[] args) {
        SpringApplication.run(ThirdApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(TaskRepository taskRepository) {
        return args -> {
            if (taskRepository.count() == 0) {
                // Populate sample data on startup if database is empty
                Task task1 = new Task(
                    "Setup Spring Boot Architecture", 
                    "Configure layered application architecture, H2/MySQL properties, input validations, and constructor injection."
                );
                task1.setCompleted(true);
                taskRepository.save(task1);

                Task task2 = new Task(
                    "Implement Global Exception Handling", 
                    "Implement GlobalExceptionHandler using @RestControllerAdvice and TaskNotFoundException."
                );
                task2.setCompleted(false);
                taskRepository.save(task2);

                Task task3 = new Task(
                    "Connect Standalone Client UI", 
                    "Build a modern light/dark toggle dashboard served separately, binding actions to backend APIs via CORS-enabled fetch queries."
                );
                task3.setCompleted(false);
                taskRepository.save(task3);

                System.out.println(">>> Sample Task Data Auto-Populated in Database successfully!");
            } else {
                System.out.println(">>> Database already contains tasks. Skipping auto-population.");
            }
        };
    }
}

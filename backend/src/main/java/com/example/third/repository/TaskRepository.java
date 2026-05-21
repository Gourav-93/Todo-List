package com.example.third.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.third.model.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Get all completed tasks, ordered by newest first
    List<Task> findByCompletedTrueOrderByCreatedAtDesc();
    
    // Get all pending tasks, ordered by newest first
    List<Task> findByCompletedFalseOrderByCreatedAtDesc();
    
    // Get all tasks, ordered by newest first
    List<Task> findAllByOrderByCreatedAtDesc();
}

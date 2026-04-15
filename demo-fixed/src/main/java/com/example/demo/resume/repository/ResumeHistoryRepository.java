package com.example.demo.resume.repository;

import com.example.demo.resume.entity.ResumeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResumeHistoryRepository extends JpaRepository<ResumeHistory, Long> {
    List<ResumeHistory> findByUserIdOrderByIdDesc(Long userId);
}
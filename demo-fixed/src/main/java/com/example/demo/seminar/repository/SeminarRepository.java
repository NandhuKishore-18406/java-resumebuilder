package com.example.demo.seminar.repository;

import com.example.demo.seminar.entity.Seminar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeminarRepository extends JpaRepository<Seminar, Long> {
    List<Seminar> findByUserIdAndCompletedOrderByDateDesc(Long userId, Boolean completed);
}
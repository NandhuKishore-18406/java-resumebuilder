package com.example.demo.seminar.repository;

import com.example.demo.seminar.entity.Seminar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeminarRepository extends JpaRepository<Seminar, Long> {
    List<Seminar> findByUserIdAndCompletedOrderByDateDesc(Long userId, Boolean completed);
    Optional<Seminar> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
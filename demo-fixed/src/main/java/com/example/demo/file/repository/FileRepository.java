package com.example.demo.file.repository;

import com.example.demo.file.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByUserIdOrderByIdDesc(Long userId);
}
package com.example.demo.resume.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "resume_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResumeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 255)
    private String label;

    @Column(nullable = false)
    private String savedAt;

    @Column(columnDefinition = "JSONB")
    private String resumeData;
}
package com.example.demo.resume.service;

import com.example.demo.resume.entity.ResumeHistory;
import com.example.demo.resume.repository.ResumeHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ResumeHistoryService {

    @Autowired
    private ResumeHistoryRepository resumeHistoryRepository;

    public List<ResumeHistory> getHistory(Long userId) {
        List<ResumeHistory> all = resumeHistoryRepository.findByUserIdOrderByIdDesc(userId);
        return all.stream().limit(4).toList();
    }

    public ResumeHistory saveSnapshot(ResumeHistory snapshot) {
        return resumeHistoryRepository.save(snapshot);
    }

    public void deleteSnapshot(Long id) {
        resumeHistoryRepository.deleteById(id);
    }
}
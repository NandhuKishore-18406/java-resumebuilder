package com.example.demo.resume.controller;

import com.example.demo.resume.entity.ResumeHistory;
import com.example.demo.resume.service.ResumeHistoryService;
import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resume/history")
public class ResumeHistoryController {

    @Autowired
    private ResumeHistoryService resumeHistoryService;

    @GetMapping
    public ResponseEntity<List<ResumeHistory>> getHistory(@AuthenticationPrincipal User user) {
        List<ResumeHistory> history = resumeHistoryService.getHistory(user.getId());
        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ResponseEntity<ResumeHistory> saveSnapshot(
            @AuthenticationPrincipal User user,
            @RequestBody ResumeHistory snapshot) {
        snapshot.setUserId(user.getId());
        ResumeHistory saved = resumeHistoryService.saveSnapshot(snapshot);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSnapshot(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        resumeHistoryService.deleteSnapshot(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
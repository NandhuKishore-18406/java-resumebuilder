package com.example.demo.seminar.controller;

import com.example.demo.seminar.entity.Seminar;
import com.example.demo.seminar.service.SeminarService;
import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seminars")
public class SeminarController {

    @Autowired
    private SeminarService seminarService;

    @GetMapping
    public ResponseEntity<Map<String, List<Seminar>>> getSeminars(@AuthenticationPrincipal User user) {
        List<Seminar> completed = seminarService.getCompletedSeminars(user.getId());
        List<Seminar> queue = seminarService.getQueuedSeminars(user.getId());
        return ResponseEntity.ok(Map.of("completed", completed, "queue", queue));
    }

    @PostMapping
    public ResponseEntity<Seminar> addSeminar(
            @AuthenticationPrincipal User user,
            @RequestBody Seminar seminar) {
        seminar.setUserId(user.getId());
        Seminar saved = seminarService.saveSeminar(seminar);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSeminar(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Seminar seminar) {
        Optional<Seminar> existingOpt = seminarService.findByIdAndUserId(id, user.getId());
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied or seminar not found"));
        }
        Seminar existing = existingOpt.get();
        existing.setTitle(seminar.getTitle());
        existing.setOrg(seminar.getOrg());
        existing.setDate(seminar.getDate());
        existing.setNotes(seminar.getNotes());
        existing.setCompleted(seminar.getCompleted());
        Seminar saved = seminarService.saveSeminar(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeminar(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        seminarService.deleteSeminar(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
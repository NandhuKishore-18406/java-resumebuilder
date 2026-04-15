package com.example.demo.file.controller;

import com.example.demo.file.entity.FileEntity;
import com.example.demo.file.service.FileService;
import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @GetMapping
    public ResponseEntity<List<FileEntity>> getFiles(@AuthenticationPrincipal User user) {
        List<FileEntity> files = fileService.getFiles(user.getId());
        return ResponseEntity.ok(files);
    }

    @PostMapping
    public ResponseEntity<FileEntity> addFile(
            @AuthenticationPrincipal User user,
            @RequestBody FileEntity file) {
        file.setUserId(user.getId());
        FileEntity saved = fileService.saveFile(file);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }
}
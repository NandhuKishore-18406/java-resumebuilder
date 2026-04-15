package com.example.demo.file.service;

import com.example.demo.file.entity.FileEntity;
import com.example.demo.file.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    public List<FileEntity> getFiles(Long userId) {
        return fileRepository.findByUserIdOrderByIdDesc(userId);
    }

    public FileEntity saveFile(FileEntity file) {
        return fileRepository.save(file);
    }

    public void deleteFile(Long id) {
        fileRepository.deleteById(id);
    }
}
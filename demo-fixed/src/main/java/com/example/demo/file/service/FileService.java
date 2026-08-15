package com.example.demo.file.service;

import com.example.demo.file.entity.FileEntity;
import com.example.demo.file.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileService {

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @Autowired
    private FileRepository fileRepository;

    public FileService() {
        try {
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create directory for uploaded files.", ex);
        }
    }

    public List<FileEntity> getFiles(Long userId) {
        return fileRepository.findByUserIdOrderByIdDesc(userId);
    }

    public FileEntity storeFile(MultipartFile file, Long userId) throws IOException {
        String rawFileName = Objects.toString(file.getOriginalFilename(), "file");
        String originalFileName = Paths.get(rawFileName).getFileName().toString();
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
        Path targetLocation = fileStorageLocation.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        FileEntity fileEntity = new FileEntity();
        fileEntity.setUserId(userId);
        fileEntity.setOriginalName(originalFileName);
        fileEntity.setFileSize(file.getSize());
        fileEntity.setMimeType(file.getContentType());
        fileEntity.setStoredPath(targetLocation.toString());

        return fileRepository.save(fileEntity);
    }

    public Optional<FileEntity> getFile(Long id, Long userId) {
        return fileRepository.findByIdAndUserId(id, userId);
    }

    public Resource loadFileAsResource(FileEntity fileEntity) throws IOException {
        Path filePath = Paths.get(fileEntity.getStoredPath()).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("File not found on disk");
        }
    }

    @Transactional
    public void deleteFile(Long id, Long userId) {
        Optional<FileEntity> fileEntityOpt = fileRepository.findByIdAndUserId(id, userId);
        if (fileEntityOpt.isPresent()) {
            FileEntity fileEntity = fileEntityOpt.get();
            try {
                Path filePath = Paths.get(fileEntity.getStoredPath());
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {}
            fileRepository.deleteByIdAndUserId(id, userId);
        }
    }

    private static class Objects {
        public static String toString(Object o, String defaultValue) {
            return (o != null) ? o.toString() : defaultValue;
        }
    }
}
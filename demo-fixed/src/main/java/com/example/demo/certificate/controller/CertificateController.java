package com.example.demo.certificate.controller;

import com.example.demo.certificate.entity.Certificate;
import com.example.demo.certificate.service.CertificateService;
import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @GetMapping
    public ResponseEntity<List<Certificate>> getCertificates(@AuthenticationPrincipal User user) {
        List<Certificate> certs = certificateService.getCertificates(user.getId());
        return ResponseEntity.ok(certs);
    }

    @PostMapping
    public ResponseEntity<Certificate> addCertificate(
            @AuthenticationPrincipal User user,
            @RequestBody Certificate certificate) {
        certificate.setUserId(user.getId());
        Certificate saved = certificateService.saveCertificate(certificate);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCertificate(@PathVariable Long id) {
        certificateService.deleteCertificate(id);
        return ResponseEntity.noContent().build();
    }
}
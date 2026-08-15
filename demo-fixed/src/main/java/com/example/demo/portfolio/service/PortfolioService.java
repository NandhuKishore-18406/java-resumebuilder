package com.example.demo.portfolio.service;

import com.example.demo.profile.entity.Profile;
import com.example.demo.profile.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class PortfolioService {

    @Autowired
    private ProfileRepository profileRepository;

    public byte[] generatePortfolioZip(Long userId, String customHtml, String customCss, String customJs) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            // Write index.html
            ZipEntry htmlEntry = new ZipEntry("index.html");
            zos.putNextEntry(htmlEntry);
            zos.write(customHtml.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // Write style.css
            ZipEntry cssEntry = new ZipEntry("style.css");
            zos.putNextEntry(cssEntry);
            zos.write(customCss.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // Write script.js
            ZipEntry jsEntry = new ZipEntry("script.js");
            zos.putNextEntry(jsEntry);
            zos.write(customJs.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }
        return baos.toByteArray();
    }
}

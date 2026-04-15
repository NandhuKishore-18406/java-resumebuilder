package com.example.demo.profile.controller;

import com.example.demo.profile.entity.Profile;
import com.example.demo.profile.service.ProfileService;
import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<Profile> getProfile(@AuthenticationPrincipal User user) {
        Profile profile = profileService.getProfile(user);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<Profile> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody Profile profile) {
        profile.setUserId(user.getId());
        Profile saved = profileService.saveProfile(profile);
        return ResponseEntity.ok(saved);
    }
}
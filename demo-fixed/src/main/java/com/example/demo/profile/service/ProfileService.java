package com.example.demo.profile.service;

import com.example.demo.profile.entity.Profile;
import com.example.demo.profile.repository.ProfileRepository;
import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    public Profile getProfile(User user) {
        return profileRepository.findByUserId(user.getId()).orElse(null);
    }

    public Profile saveProfile(Profile profile) {
        return profileRepository.save(profile);
    }
}
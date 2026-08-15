package com.example.demo.profile.service;

import com.example.demo.profile.entity.Profile;
import com.example.demo.profile.repository.ProfileRepository;
import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Transactional
    public Profile getProfile(User user) {
        Optional<Profile> existingOpt = profileRepository.findByUserId(user.getId());
        if (existingOpt.isPresent()) {
            return existingOpt.get();
        }

        // Auto-create initial profile for user if missing
        Profile newProfile = new Profile();
        newProfile.setUserId(user.getId());
        newProfile.setEmail(user.getEmail());
        newProfile.setName(user.getName());
        return profileRepository.save(newProfile);
    }

    @Transactional
    public Profile saveProfile(User user, Profile incoming) {
        Profile existing = profileRepository.findByUserId(user.getId()).orElseGet(() -> {
            Profile p = new Profile();
            p.setUserId(user.getId());
            return p;
        });

        // Copy non-null/updatable properties to existing entity
        existing.setName(incoming.getName() != null ? incoming.getName() : user.getName());
        existing.setEmail(incoming.getEmail() != null ? incoming.getEmail() : user.getEmail());
        existing.setPhone(incoming.getPhone());
        existing.setLocation(incoming.getLocation());
        existing.setUrl(incoming.getUrl());
        existing.setLinkedin(incoming.getLinkedin());
        existing.setGithub(incoming.getGithub());
        existing.setLeetcode(incoming.getLeetcode());
        existing.setBio(incoming.getBio());
        existing.setTechskills(incoming.getTechskills());
        existing.setFrameworks(incoming.getFrameworks());
        existing.setDatabases(incoming.getDatabases());
        existing.setTools(incoming.getTools());
        existing.setSoftskills(incoming.getSoftskills());
        existing.setLanguages(incoming.getLanguages());
        existing.setAwards(incoming.getAwards());
        existing.setDesignation(incoming.getDesignation());
        existing.setDepartment(incoming.getDepartment());
        existing.setInstitution(incoming.getInstitution());
        existing.setVidwanId(incoming.getVidwanId());
        existing.setOrcidId(incoming.getOrcidId());
        existing.setEducation(incoming.getEducation());
        existing.setProjects(incoming.getProjects());
        existing.setExperience(incoming.getExperience());
        existing.setPublications(incoming.getPublications());
        existing.setInterests(incoming.getInterests());

        return profileRepository.save(existing);
    }
}
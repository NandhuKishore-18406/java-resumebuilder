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

        // Merge incoming non-null properties into existing profile entity (supports partial requests)
        if (incoming.getName() != null) existing.setName(incoming.getName());
        else if (existing.getName() == null) existing.setName(user.getName());

        if (incoming.getEmail() != null) existing.setEmail(incoming.getEmail());
        else if (existing.getEmail() == null) existing.setEmail(user.getEmail());

        if (incoming.getPhone() != null) existing.setPhone(incoming.getPhone());
        if (incoming.getLocation() != null) existing.setLocation(incoming.getLocation());
        if (incoming.getUrl() != null) existing.setUrl(incoming.getUrl());
        if (incoming.getLinkedin() != null) existing.setLinkedin(incoming.getLinkedin());
        if (incoming.getGithub() != null) existing.setGithub(incoming.getGithub());
        if (incoming.getLeetcode() != null) existing.setLeetcode(incoming.getLeetcode());
        if (incoming.getBio() != null) existing.setBio(incoming.getBio());
        if (incoming.getTechskills() != null) existing.setTechskills(incoming.getTechskills());
        if (incoming.getFrameworks() != null) existing.setFrameworks(incoming.getFrameworks());
        if (incoming.getDatabases() != null) existing.setDatabases(incoming.getDatabases());
        if (incoming.getTools() != null) existing.setTools(incoming.getTools());
        if (incoming.getSoftskills() != null) existing.setSoftskills(incoming.getSoftskills());
        if (incoming.getLanguages() != null) existing.setLanguages(incoming.getLanguages());
        if (incoming.getAwards() != null) existing.setAwards(incoming.getAwards());
        if (incoming.getDesignation() != null) existing.setDesignation(incoming.getDesignation());
        if (incoming.getDepartment() != null) existing.setDepartment(incoming.getDepartment());
        if (incoming.getInstitution() != null) existing.setInstitution(incoming.getInstitution());
        if (incoming.getVidwanId() != null) existing.setVidwanId(incoming.getVidwanId());
        if (incoming.getOrcidId() != null) existing.setOrcidId(incoming.getOrcidId());
        if (incoming.getEducation() != null) existing.setEducation(incoming.getEducation());
        if (incoming.getProjects() != null) existing.setProjects(incoming.getProjects());
        if (incoming.getExperience() != null) existing.setExperience(incoming.getExperience());
        if (incoming.getPublications() != null) existing.setPublications(incoming.getPublications());
        if (incoming.getInterests() != null) existing.setInterests(incoming.getInterests());

        return profileRepository.save(existing);
    }
}
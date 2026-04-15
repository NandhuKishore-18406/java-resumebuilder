package com.example.demo.profile.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonRawValue;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 255)
    private String name;

    @Column(length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 255)
    private String location;

    @Column(length = 500)
    private String url;

    @Column(length = 255)
    private String linkedin;

    @Column(length = 255)
    private String github;

    @Column(length = 255)
    private String leetcode;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String techskills;

    @Column(columnDefinition = "TEXT")
    private String frameworks;

    @Column(columnDefinition = "TEXT")
    private String databases;

    @Column(columnDefinition = "TEXT")
    private String tools;

    @Column(columnDefinition = "TEXT")
    private String softskills;

    @Column(columnDefinition = "TEXT")
    private String languages;

    @Column(columnDefinition = "TEXT")
    private String awards;

    @Column(length = 255)
    private String designation;

    @Column(length = 255)
    private String department;

    @Column(length = 255)
    private String institution;

    @Column(length = 255)
    private String vidwanId;

    @Column(length = 255)
    private String orcidId;

    @Column(columnDefinition = "JSONB")
    @JsonRawValue
    private String education;

    @Column(columnDefinition = "JSONB")
    @JsonRawValue
    private String projects;

    @Column(columnDefinition = "JSONB")
    @JsonRawValue
    private String experience;

    @Column(columnDefinition = "JSONB")
    @JsonRawValue
    private String publications;

    @Column(length = 255)
    private String interests;
}
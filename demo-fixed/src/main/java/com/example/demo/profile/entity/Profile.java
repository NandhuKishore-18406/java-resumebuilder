package com.example.demo.profile.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.example.demo.profile.util.KeepAsJsonStringDeserializer;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "profiles")
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
    @JsonRawValue
    @JsonDeserialize(using = KeepAsJsonStringDeserializer.class)
    private String languages;

    @Column(columnDefinition = "TEXT")
    @JsonRawValue
    @JsonDeserialize(using = KeepAsJsonStringDeserializer.class)
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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    @JsonRawValue
    @JsonDeserialize(using = KeepAsJsonStringDeserializer.class)
    private String education;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    @JsonRawValue
    @JsonDeserialize(using = KeepAsJsonStringDeserializer.class)
    private String projects;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    @JsonRawValue
    @JsonDeserialize(using = KeepAsJsonStringDeserializer.class)
    private String experience;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    @JsonRawValue
    @JsonDeserialize(using = KeepAsJsonStringDeserializer.class)
    private String publications;

    @Column(length = 255)
    private String interests;

    public Profile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }

    public String getLeetcode() { return leetcode; }
    public void setLeetcode(String leetcode) { this.leetcode = leetcode; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getTechskills() { return techskills; }
    public void setTechskills(String techskills) { this.techskills = techskills; }

    public String getFrameworks() { return frameworks; }
    public void setFrameworks(String frameworks) { this.frameworks = frameworks; }

    public String getDatabases() { return databases; }
    public void setDatabases(String databases) { this.databases = databases; }

    public String getTools() { return tools; }
    public void setTools(String tools) { this.tools = tools; }

    public String getSoftskills() { return softskills; }
    public void setSoftskills(String softskills) { this.softskills = softskills; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public String getAwards() { return awards; }
    public void setAwards(String awards) { this.awards = awards; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getVidwanId() { return vidwanId; }
    public void setVidwanId(String vidwanId) { this.vidwanId = vidwanId; }

    public String getOrcidId() { return orcidId; }
    public void setOrcidId(String orcidId) { this.orcidId = orcidId; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getProjects() { return projects; }
    public void setProjects(String projects) { this.projects = projects; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getPublications() { return publications; }
    public void setPublications(String publications) { this.publications = publications; }

    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
}
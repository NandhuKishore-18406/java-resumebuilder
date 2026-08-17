package com.example.demo.profile;

import com.example.demo.profile.entity.Profile;
import com.example.demo.profile.service.ProfileService;
import com.example.demo.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProfileService profileService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User(1L, "test@example.com", "password", "Test User", null);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(mockUser, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testSaveProfileWithArrayLanguagesAndAwards() throws Exception {
        String jsonPayload = """
            {
                "name": "Test User",
                "email": "test@example.com",
                "languages": ["English", "Spanish"],
                "awards": ["Award 1", "Award 2"],
                "education": [{"institution": "Test University", "degree": "B.Tech"}],
                "projects": [{"title": "Test Project"}],
                "experience": [{"role": "Developer"}],
                "publications": [{"title": "Test Paper"}]
            }
            """;

        Profile mockSavedProfile = new Profile();
        mockSavedProfile.setId(1L);
        mockSavedProfile.setUserId(1L);
        mockSavedProfile.setName("Test User");
        mockSavedProfile.setLanguages("[\"English\",\"Spanish\"]");
        mockSavedProfile.setAwards("[\"Award 1\",\"Award 2\"]");

        when(profileService.saveProfile(any(User.class), any(Profile.class))).thenReturn(mockSavedProfile);

        mockMvc.perform(put("/api/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk());
    }

    @Test
    void testSaveProfileWithPartialInput() throws Exception {
        String partialJson = """
            {
                "name": "Updated Name",
                "phone": "9876543210"
            }
            """;

        Profile mockSavedProfile = new Profile();
        mockSavedProfile.setId(1L);
        mockSavedProfile.setUserId(1L);
        mockSavedProfile.setName("Updated Name");
        mockSavedProfile.setPhone("9876543210");

        when(profileService.saveProfile(any(User.class), any(Profile.class))).thenReturn(mockSavedProfile);

        mockMvc.perform(put("/api/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(partialJson))
                .andExpect(status().isOk());
    }
}

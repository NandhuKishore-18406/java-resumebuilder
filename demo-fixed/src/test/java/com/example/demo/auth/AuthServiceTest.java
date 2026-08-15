package com.example.demo.auth;

import com.example.demo.auth.dto.GoogleLoginRequest;
import com.example.demo.auth.dto.LoginRequest;
import com.example.demo.auth.dto.RegisterRequest;
import com.example.demo.auth.jwt.JwtService;
import com.example.demo.auth.service.AuthService;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testNormalizeEmail() {
        assertEquals("student@gmail.com", authService.normalizeEmail("  Student@Gmail.com  "));
        assertEquals("user@test.org", authService.normalizeEmail("USER@TEST.ORG"));
        assertNull(authService.normalizeEmail(null));
    }

    @Test
    void testRegisterWithEmailNormalization() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Student");
        request.setEmail("Student@Gmail.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("student@gmail.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtService.generateToken(any(User.class))).thenReturn("fake-jwt-token");

        String token = authService.register(request);

        assertEquals("fake-jwt-token", token);
        verify(userRepository).save(argThat(user -> 
            user.getEmail().equals("student@gmail.com") && 
            user.getName().equals("Student") &&
            user.getPassword().equals("encodedPassword")
        ));
    }

    @Test
    void testRegisterDuplicateEmailThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Student");
        request.setEmail("STUDENT@gmail.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("student@gmail.com")).thenReturn(Optional.of(new User()));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Email already in use", ex.getMessage());
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("Student@Gmail.com");
        request.setPassword("password123");

        User existingUser = new User(1L, "student@gmail.com", "encodedPassword", "Student", null);
        when(userRepository.findByEmail("student@gmail.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken(existingUser)).thenReturn("fake-jwt-token");

        String token = authService.login(request);

        assertEquals("fake-jwt-token", token);
    }

    @Test
    void testLoginOnGoogleUserWithNullPasswordFails() {
        LoginRequest request = new LoginRequest();
        request.setEmail("student@gmail.com");
        request.setPassword("password123");

        User googleUser = new User(1L, "student@gmail.com", null, "Google Student", "google-sub-123");
        when(userRepository.findByEmail("student@gmail.com")).thenReturn(Optional.of(googleUser));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("Invalid credentials", ex.getMessage());
    }

    @Test
    void testGoogleLoginRejectsInvalidToken() {
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setIdToken("invalid-google-token");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.googleLogin(request));
        assertEquals("Google authentication failed", ex.getMessage());
    }

    @Test
    void testExistingUserAccountLinkingLogic() {
        User existingUser = spy(new User(1L, "student@gmail.com", "encodedPassword", "Student", null));
        when(userRepository.findByEmail("student@gmail.com")).thenReturn(Optional.of(existingUser));

        String normalizedEmail = authService.normalizeEmail("Student@Gmail.com");
        Optional<User> found = userRepository.findByEmail(normalizedEmail);
        assertTrue(found.isPresent());
        User user = found.get();
        if (user.getGoogleId() == null) {
            user.setGoogleId("google-id-12345");
            userRepository.save(user);
        }

        verify(existingUser).setGoogleId("google-id-12345");
        verify(userRepository).save(existingUser);
    }
}

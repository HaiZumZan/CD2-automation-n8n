package com.example.KBAn8n.controller;

import com.example.KBAn8n.dto.AuthResponse;
import com.example.KBAn8n.dto.LoginRequest;
import com.example.KBAn8n.dto.RegisterRequest;
import com.example.KBAn8n.entity.User;
import com.example.KBAn8n.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.KBAn8n.security.JwtUtils;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
 // <-- Thêm cái này để nó tự tạo Constructor cho các biến 'final'
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) { // Dùng DTO bạn đã tạo
        // 1. Kiểm tra username tồn tại
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username này có người dùng rồi!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Mã hóa pass
        user.setRole(request.getRole() != null ? request.getRole() : "USER");

        // 3. Lưu xuống Supabase
        userRepository.save(user);

        return ResponseEntity.ok("Đăng ký thành công! Giờ bạn hãy sang Login nhé.");
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        System.out.println("DEBUG - Username nhận được từ Client: [" + loginRequest.getUsername() + "]");
        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            String token = jwtUtils.generateToken(user.getUsername(), user.getRole());
            return ResponseEntity.ok(new AuthResponse(token, user.getRole()));
        }

        return ResponseEntity.status(401).body("Sai mật khẩu");
    }
}
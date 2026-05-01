package com.example.KBAn8n.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor // Tạo Constructor chứa tất cả các trường để gọi 'new AuthResponse(...)'
public class AuthResponse {
    private String token;
    private String role;
}
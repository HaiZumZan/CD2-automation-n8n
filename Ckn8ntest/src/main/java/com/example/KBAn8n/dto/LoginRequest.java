package com.example.KBAn8n.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Tự động tạo Getter, Setter nhờ Lombok
@NoArgsConstructor // BẮT BUỘC PHẢI CÓ để Spring đọc được JSON
@AllArgsConstructor
public class LoginRequest {
    private String username;
    private String password;
}
package com.example.KBAn8n.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String role;

    // 🌟 THÊM TRƯỜNG NÀY: Để Admin có thể Khóa / Mở khóa tài khoản
    // Mặc định khi tạo tài khoản mới là true (được phép đăng nhập)
    // Sửa lại đoạn cấu hình cột này
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;
}
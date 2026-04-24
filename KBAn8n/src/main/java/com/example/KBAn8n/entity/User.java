package com.example.KBAn8n.entity;

import jakarta.persistence.*; // Đảm bảo bạn dùng jakarta cho Spring Boot 3
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor // Cực kỳ quan trọng để Jackson hoạt động
@AllArgsConstructor
@Entity
@Table(name = "users")
@Data
public class User {

    @Id // ĐÁNH DẤU ĐÂY LÀ KHÓA CHÍNH
    @GeneratedValue(strategy = GenerationType.IDENTITY) // TỰ ĐỘNG TĂNG ID TRONG MYSQL (AUTO_INCREMENT)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String role;
}
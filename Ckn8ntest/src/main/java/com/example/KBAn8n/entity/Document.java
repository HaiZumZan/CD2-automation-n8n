package com.example.KBAn8n.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String filePath;
    private String ownerUsername; // Lưu tên người upload
    private boolean isGlobal;      // true: Admin upload (chung), false: Cá nhân
    private LocalDateTime createdAt = LocalDateTime.now();
}
package com.example.KBAn8n.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "owner_username")
    private String ownerUsername;

    @Column(name = "is_global")
    private boolean isGlobal;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    // ✨ THÊM DÒNG NÀY ĐỂ HẾT LỖI ĐỎ ✨
    @Column(name = "file_path")
    private String filePath;

    @Column(name = "faculty")
    private String faculty;

    @Column(name = "major")
    private String major;

    @Column(name = "subject")
    private String subject; // Mô
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String keywords; // Thêm vào để thoải mái lưu trữ từ khóa dài
}
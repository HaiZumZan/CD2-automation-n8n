// src/main/java/com/example/KBAn8n/repository/FileRepository.java
package com.example.KBAn8n.repository;

import com.example.KBAn8n.entity.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FileRepository extends JpaRepository<FileMetadata, Long> {
    List<FileMetadata> findByOwnerUsername(String username);
    List<FileMetadata> findByIsGlobalTrue();
    // 1. Dành cho trang Thư viện số: Lấy tài liệu chung theo Khoa -> Ngành -> Môn
    List<FileMetadata> findByIsGlobalTrueAndFacultyAndMajorAndSubject(String faculty, String major, String subject);

    // 2. Dành cho Không gian cá nhân: Lấy tài liệu riêng của một sinh viên
    List<FileMetadata> findByOwnerUsernameAndIsGlobalFalse(String username);
}
package com.example.KBAn8n.repository;

import com.example.KBAn8n.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    // Tìm file của cá nhân HOẶC file dùng chung
    List<Document> findByOwnerUsernameOrIsGlobalTrue(String username);
}
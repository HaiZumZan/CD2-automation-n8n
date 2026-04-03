package com.example.KBAn8n.repository;

import com.example.KBAn8n.model.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends JpaRepository<ChatHistory, Long> {
    // Để trống vì JpaRepository đã có sẵn các hàm save(), findAll()...
}
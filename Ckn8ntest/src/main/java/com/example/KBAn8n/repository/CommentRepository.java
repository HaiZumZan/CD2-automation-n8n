package com.example.KBAn8n.repository;

import com.example.KBAn8n.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Tự động tìm tất cả comment của một file, sắp xếp mới nhất lên đầu
    List<Comment> findByFileIdOrderByCreatedAtDesc(Long fileId);
}
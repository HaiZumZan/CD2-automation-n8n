package com.example.KBAn8n.controller;

import com.example.KBAn8n.entity.Comment;
import com.example.KBAn8n.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;

    // 1. Lấy danh sách bình luận của một file cụ thể
    @GetMapping("/{fileId}")
    public ResponseEntity<?> getCommentsByFile(@PathVariable Long fileId) {
        return ResponseEntity.ok(commentRepository.findByFileIdOrderByCreatedAtDesc(fileId));
    }

    // 2. Thêm bình luận mới vào file
    @PostMapping("/")
    public ResponseEntity<?> addComment(
            @RequestBody Comment commentRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) return ResponseEntity.status(401).body("Lỗi xác thực!");

        Comment newComment = Comment.builder()
                .fileId(commentRequest.getFileId())
                .username(userDetails.getUsername()) // Tự động lấy tên sinh viên đang đăng nhập
                .content(commentRequest.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        commentRepository.save(newComment);
        return ResponseEntity.ok("Đã thêm bình luận!");
    }
}
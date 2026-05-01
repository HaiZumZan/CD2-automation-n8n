package com.example.KBAn8n.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long fileId; // ID của file mà comment này thuộc về

    @Column(nullable = false)
    private String username; // Người comment

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // Nội dung comment

    private LocalDateTime createdAt;
}
package com.example.KBAn8n.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message; // Nội dung câu hỏi của sinh viên
    private String type;    // Loại yêu cầu: "summary" hoặc "mindmap"
}

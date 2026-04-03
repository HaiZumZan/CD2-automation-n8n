package com.example.KBAn8n.controller;

import com.example.KBAn8n.model.ChatHistory;
import com.example.KBAn8n.repository.ChatRepository;
import com.example.KBAn8n.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Quan trọng: Để React gọi vào không bị lỗi CORS
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private ChatRepository chatRepository;

    @PostMapping("/ask")
    public Map<String, String> chatWithAI(@RequestBody Map<String, String> payload) {
        String userMsg = payload.get("message");

        // 1. Gọi Service để hỏi n8n
        String aiAnswer = chatService.askN8n(userMsg);

        // 2. Lưu vào MySQL (XAMPP) để làm bằng chứng Backend cho giảng viên
        ChatHistory history = new ChatHistory();
        history.setStudentMessage(userMsg);
        history.setAiResponse(aiAnswer);
        chatRepository.save(history);

        // 3. Trả kết quả về cho React
        return Map.of("answer", aiAnswer);
    }
}
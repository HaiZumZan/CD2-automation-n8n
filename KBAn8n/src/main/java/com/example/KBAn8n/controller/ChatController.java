package com.example.KBAn8n.controller;

import com.example.KBAn8n.model.ChatHistory;
import com.example.KBAn8n.repository.ChatRepository;
import com.example.KBAn8n.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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

        // 1. Xác định người dùng (Để test bạn có thể để "hoa")
        // Sau này khi có JWT, bạn sẽ lấy username từ SecurityContextHolder
        String username = "hoa";

        // 2. Gọi Service với ĐỦ 2 THAM SỐ
        String aiAnswer = chatService.askN8n(userMsg, username);

        // 3. Trả về kết quả
        Map<String, String> response = new HashMap<>();
        response.put("answer", aiAnswer);
        return response;
    }
    @GetMapping("/history")
    public List<ChatHistory> getChatHistory() {
        // Trình tự: Lấy toàn bộ tin nhắn từ Repository
        // Bạn có thể dùng findAll() hoặc viết Query để lấy theo thời gian/User
        return chatRepository.findAll();
    }
}
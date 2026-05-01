package com.example.KBAn8n.controller;

import com.example.KBAn8n.model.ChatHistory;
import com.example.KBAn8n.repository.ChatRepository;
import com.example.KBAn8n.service.ChatService;
import com.example.KBAn8n.service.N8nService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Giữ nguyên để React gọi vào không bị lỗi CORS
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private N8nService n8nService; // Thêm N8nService vào để gọi luồng RAG mới

    // Đã sửa /ask thành chuẩn xác thực Token và nhận thêm dữ liệu
    @PostMapping("/ask")
    public ResponseEntity<?> chatWithAI(@RequestBody Map<String, String> payload,
                                        @AuthenticationPrincipal UserDetails userDetails) {

        // 1. Kiểm tra Token đăng nhập
        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");
        String username = userDetails.getUsername(); // Lấy username thật

        // 2. Lấy dữ liệu câu hỏi và bộ lọc từ React
        String userMsg = payload.get("message");
        boolean isGlobal = Boolean.parseBoolean(payload.getOrDefault("isGlobal", "false"));
        String faculty = payload.getOrDefault("faculty", "");
        String major = payload.getOrDefault("major", "");
        String subject = payload.getOrDefault("subject", "");

        // 3. Gọi sang n8n (Sử dụng luồng Chat mới)
        String aiAnswer = n8nService.sendChatRequest(userMsg, username, isGlobal, faculty, major, subject);

        // --- KÍCH HOẠT: LƯU LỊCH SỬ CHAT VÀO DATABASE ---
        ChatHistory history = new ChatHistory();
        history.setUsername(username);
        history.setStudentMessage(userMsg); // Gọi đúng tên biến của Hoa
        history.setAiResponse(aiAnswer);
        chatRepository.save(history);

        // 4. Trả kết quả về cho React
        Map<String, String> response = new HashMap<>();
        response.put("answer", aiAnswer);
        return ResponseEntity.ok(response);
    }

    // Giữ nguyên API lấy lịch sử cũ của Hoa
    @GetMapping("/history")
    public List<ChatHistory> getChatHistory() {
        return chatRepository.findAll();
    }
}
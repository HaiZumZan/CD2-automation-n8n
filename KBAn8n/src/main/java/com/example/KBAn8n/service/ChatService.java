package com.example.KBAn8n.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChatService {

    public String askN8n(String message) {
        String n8nUrl = "http://localhost:5678/webhook-test/ask-student";
        RestTemplate restTemplate = new RestTemplate();

        Map<String, String> body = new HashMap<>();
        body.put("studentMsg", message);

        try {
            // Thay vì Map.class, hãy dùng String.class để nhận chuỗi thô trước nếu cần
            // Hoặc giữ Map.class nhưng phải đảm bảo n8n trả về đúng {"answer": "..."}
            ResponseEntity<Map> response = restTemplate.postForEntity(n8nUrl, body, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("answer")) {
                return response.getBody().get("answer").toString();
            }
            return "AI đã phản hồi nhưng cấu trúc dữ liệu không đúng.";
        } catch (Exception e) {
            return "Lỗi kết nối đến bộ não AI: " + e.getMessage();
        }
    }
}
package com.example.KBAn8n.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final RestTemplate restTemplate = new RestTemplate();

    // Dùng chung một URL ngrok của Hoa
    private final String N8N_URL = "https://cornell-unpugilistic-dorsoventrally.ngrok-free.dev/webhook-test/upload-document";

    public String askN8n(String message, String username) {
        try {
            // SỬA: Dùng .build().encode().toUri() để tiếng Việt không bị lỗi %25C3
            URI finalUri = UriComponentsBuilder.fromHttpUrl(N8N_URL)
                    .queryParam("task", "chat")
                    .queryParam("owner_username", username)
                    .queryParam("question", message)
                    .build()
                    .encode()
                    .toUri();

            System.out.println("--- [DEBUG] Đang gọi n8n Chat: " + finalUri);

            // Gửi POST nhưng không có Body (vì dữ liệu nằm hết trên URL rồi)
            return restTemplate.postForObject(finalUri, null, String.class);
        } catch (Exception e) {
            return "Lỗi kết nối bộ não AI: " + e.getMessage();
        }
    }

    public String searchInDocuments(String query, String username) {
        try {
            URI finalUri = UriComponentsBuilder.fromHttpUrl(N8N_URL)
                    .queryParam("task", "search")
                    .queryParam("owner_username", username)
                    .queryParam("question", query)
                    .build()
                    .encode()
                    .toUri();

            System.out.println("--- [DEBUG] Đang gọi n8n Search: " + finalUri);

            // Đổi GET thành POST cho đồng bộ với Webhook n8n
            return restTemplate.postForObject(finalUri, null, String.class);
        } catch (Exception e) {
            return "Lỗi tìm kiếm: " + e.getMessage();
        }
    }
}
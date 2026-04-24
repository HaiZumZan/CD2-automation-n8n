package com.example.KBAn8n.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${n8n.webhook.url}")
    private  String N8N_URL;
    public String askN8n(String message, String username) {
        try {
            URI finalUri = UriComponentsBuilder.fromHttpUrl(N8N_URL)
                    .queryParam("task", "chat")
                    .queryParam("owner_username", username)
                    .queryParam("question", message)
                    .build()
                    .encode()
                    .toUri();

            System.out.println("--- [DEBUG] Đang gọi n8n Chat: " + finalUri);

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

            return restTemplate.postForObject(finalUri, null, String.class);
        } catch (Exception e) {
            return "Lỗi tìm kiếm: " + e.getMessage();
        }
    }
}
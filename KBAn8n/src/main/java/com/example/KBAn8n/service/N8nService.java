package com.example.KBAn8n.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.File;

@Service
public class N8nService {

    @Value("${n8n.webhook.url}")
    private String n8nWebhookUrl;

    // 1. ĐÃ SỬA: Thêm faculty, major, subject vào tham số đầu vào của hàm
    public void sendFileToN8n(File file, String username, boolean isGlobal, String task,
                              String faculty, String major, String subject) {

        RestTemplate restTemplate = new RestTemplate();

        // 2. ĐÃ SỬA: Nối thêm 3 biến này vào cuối đường link URL
        String finalUrl = UriComponentsBuilder.fromHttpUrl(n8nWebhookUrl)
                .queryParam("owner_username", username)
                .queryParam("is_global", isGlobal)
                .queryParam("task", task)
                .queryParam("file_name", file.getName())
                .queryParam("faculty", faculty)
                .queryParam("major", major)
                .queryParam("subject", subject)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(file));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            System.out.println("Đang gửi tới n8n với URL: " + finalUrl);
            ResponseEntity<String> response = restTemplate.postForEntity(finalUrl, requestEntity, String.class);
            System.out.println("n8n phản hồi: " + response.getBody());
        } catch (Exception e) {
            System.err.println("Lỗi gửi n8n: " + e.getMessage());
        }
    }
}
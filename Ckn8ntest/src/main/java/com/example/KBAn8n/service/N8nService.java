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

    // 1. ĐÃ SỬA: Thêm "String fileId" vào cuối danh sách tham số (tổng cộng 8 tham số)
    public void sendFileToN8n(File file, String username, boolean isGlobal, String task,
                              String faculty, String major, String subject, String fileId) {

        RestTemplate restTemplate = new RestTemplate();

        // 2. ĐÃ SỬA: Nối thêm queryParam "file_id" vào URL
        String finalUrl = UriComponentsBuilder.fromHttpUrl(n8nWebhookUrl)
                .queryParam("owner_username", username)
                .queryParam("is_global", isGlobal)
                .queryParam("task", task)
                .queryParam("file_name", file.getName())
                .queryParam("faculty", faculty)
                .queryParam("major", major)
                .queryParam("subject", subject)
                .queryParam("file_id", fileId) // DÒNG QUAN TRỌNG NHẤT ĐÂY RỒI
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
    // THÊM HÀM NÀY VÀO DƯỚI HÀM CŨ
    public String sendChatRequest(String question, String username, boolean isGlobal,
                                  String faculty, String major, String subject) {
        RestTemplate restTemplate = new RestTemplate();

        // Nối các thông số thành URL (Task lúc này là 'chat')
        String finalUrl = org.springframework.web.util.UriComponentsBuilder.fromHttpUrl(n8nWebhookUrl)
                .queryParam("task", "chat")
                .queryParam("question", question)
                .queryParam("owner_username", username)
                .queryParam("is_global", isGlobal)
                .queryParam("faculty", faculty)
                .queryParam("major", major)
                .queryParam("subject", subject)
                .toUriString();

        // Vì webhook n8n đang cấu hình là form-data, ta tạo một form rỗng để không bị lỗi
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            System.out.println("Đang gửi câu hỏi tới n8n: " + question);
            // Gửi đi và ĐỢI n8n trả về câu trả lời trực tiếp
            ResponseEntity<String> response = restTemplate.postForEntity(finalUrl, requestEntity, String.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Lỗi gọi n8n Chat: " + e.getMessage());
            return "Xin lỗi, AI đang bận hoặc mất kết nối. Vui lòng thử lại sau!";
        }
    }
}
package com.example.KBAn8n.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;

@Service
public class N8nService {

    @Value("${n8n.webhook.url}")
    private String n8nWebhookUrl;

    // Sửa dòng này: Thêm tham số String task vào cuối
    public void sendFileToN8n(File file, String username, boolean isGlobal, String task) {
        RestTemplate restTemplate = new RestTemplate();

        // 1. Tạo URL kèm theo Query Parameters
        // Dữ liệu sẽ đi theo đường: http://url-n8n?owner_username=hoa&is_global=false...
        // 1. Tạo URL kèm theo Query Parameters một cách an toàn
        String finalUrl = org.springframework.web.util.UriComponentsBuilder.fromHttpUrl(n8nWebhookUrl)
                .queryParam("owner_username", username)
                .queryParam("is_global", isGlobal)
                .queryParam("task", task)
                .queryParam("file_name", file.getName()) // <--- ĐÂY LÀ VIÊN GẠCH CÒN THIẾU!
                .toUriString();
        // 2. Tạo Header
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // 3. Body CHỈ CHỨA DUY NHẤT FILE
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
    }}
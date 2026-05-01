package com.example.KBAn8n.service;

import com.example.KBAn8n.entity.FileMetadata;
import com.example.KBAn8n.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class StudyService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${n8n.study.webhook.url}")
    private String studyWebhookUrl;

    @Autowired
    private FileRepository fileRepository;

    public String generateFlashcards(String fileName, String currentUser) {
        String actualOwner = getActualOwner(fileName, currentUser);

        Map<String, Object> payload = new HashMap<>();
        payload.put("task", "flashcard");
        payload.put("file_name", fileName);
        payload.put("owner_username", actualOwner);
        payload.put("student_message", "");
        return callN8n(payload);
    }

    public String evaluateFeynman(String fileName, String currentUser, String studentMessage) {
        String actualOwner = getActualOwner(fileName, currentUser);

        Map<String, Object> payload = new HashMap<>();
        payload.put("task", "feynman");
        payload.put("file_name", fileName);
        payload.put("owner_username", actualOwner);
        payload.put("student_message", studentMessage);
        return callN8n(payload);
    }


    private String getActualOwner(String fileName, String currentUser) {
        return fileRepository.findByOwnerUsernameOrIsGlobalTrue(currentUser).stream()
                .filter(f -> f.getFileName().equals(fileName))
                .map(FileMetadata::getOwnerUsername)
                .findFirst()
                .orElse(currentUser);
    }

    private String callN8n(Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            System.out.println("[DEBUG StudyService] Gọi n8n: " + studyWebhookUrl);
            System.out.println("[DEBUG StudyService] Payload gửi đi: " + payload);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    studyWebhookUrl, request, String.class
            );
            return response.getBody();

        } catch (Exception e) {
            System.err.println("[ERROR StudyService] " + e.getMessage());
            return "{\"error\": \"Lỗi kết nối n8n: " + e.getMessage() + "\"}";
        }
    }
}
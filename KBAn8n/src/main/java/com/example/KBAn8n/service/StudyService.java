package com.example.KBAn8n.service;

import com.example.KBAn8n.entity.FileMetadata;
import com.example.KBAn8n.entity.Flashcard;
import com.example.KBAn8n.repository.FileRepository;
import com.example.KBAn8n.repository.FlashcardRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudyService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @Value("${n8n.study.webhook.url}")
    private String studyWebhookUrl;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private FlashcardRepository flashcardRepository;

    public String generateFlashcards(String fileName, String currentUser) {
        // 1. Kiểm tra trong Database (Supabase) trước để cá nhân hóa
        List<Flashcard> existingFlashcards = flashcardRepository.findByUsernameAndFileName(currentUser, fileName);
        if (!existingFlashcards.isEmpty()) {
            System.out.println("[DEBUG StudyService] Lấy Flashcard từ DB cho user: " + currentUser);
            try {
                return objectMapper.writeValueAsString(existingFlashcards);
            } catch (Exception e) {
                System.err.println("[ERROR StudyService] Lỗi convert DB sang JSON: " + e.getMessage());
            }
        }

        // 2. Nếu chưa có thì mới gọi n8n
        String actualOwner = getActualOwner(fileName, currentUser);
        Map<String, Object> payload = new HashMap<>();
        payload.put("task", "flashcard");
        payload.put("file_name", fileName);
        payload.put("owner_username", actualOwner);
        payload.put("student_message", "");

        String aiResponse = callN8n(payload);

        // 3. Lưu kết quả vào DB để ghi nhớ (Cá nhân hóa)
        saveFlashcardsToDb(aiResponse, currentUser, fileName);

        return aiResponse;
    }

    private void saveFlashcardsToDb(String jsonResponse, String username, String fileName) {
        try {
            com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(jsonResponse);
            com.fasterxml.jackson.databind.JsonNode cardsNode = rootNode;
            
            // Nếu n8n trả về {"flashcards": [...]}
            if (rootNode.has("flashcards") && rootNode.get("flashcards").isArray()) {
                cardsNode = rootNode.get("flashcards");
            }
            
            if (cardsNode.isArray()) {
                List<Map<String, String>> cards = objectMapper.convertValue(
                    cardsNode, 
                    new TypeReference<List<Map<String, String>>>() {}
                );

                List<Flashcard> flashcards = cards.stream().map(card -> Flashcard.builder()
                        .username(username)
                        .fileName(fileName)
                        .question(card.get("question"))
                        .answer(card.get("answer"))
                        .build()).collect(Collectors.toList());

                flashcardRepository.saveAll(flashcards);
                System.out.println("[DEBUG StudyService] Đã lưu " + flashcards.size() + " flashcards vào Supabase.");
            } else {
                System.err.println("[ERROR StudyService] JSON không phải là mảng flashcards hợp lệ: " + jsonResponse);
            }
        } catch (Exception e) {
            System.err.println("[ERROR StudyService] Không thể lưu Flashcard vào DB: " + e.getMessage());
        }
    }

    public String evaluateFeynman(String fileName, String currentUser, String studentMessage, String persona) {
        String actualOwner = getActualOwner(fileName, currentUser);

        Map<String, Object> payload = new HashMap<>();
        payload.put("task", "feynman");
        payload.put("file_name", fileName);
        payload.put("owner_username", actualOwner);
        payload.put("student_message", studentMessage);
        payload.put("persona", persona != null ? persona : "Giáo sư Đại học");
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
            ResponseEntity<String> response = restTemplate.postForEntity(
                    studyWebhookUrl, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("[ERROR StudyService] " + e.getMessage());
            return "{\"error\": \"Lỗi kết nối n8n: " + e.getMessage() + "\"}";
        }
    }

    public List<String> getLearnedFiles(String username) {
        return flashcardRepository.findDistinctFileNamesByUsername(username);
    }
}
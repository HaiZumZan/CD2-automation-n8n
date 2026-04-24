package com.example.KBAn8n.controller;

import com.example.KBAn8n.dto.StudyRequest;
import com.example.KBAn8n.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class StudyController {

    private final StudyService studyService;

    @PostMapping("/flashcard")
    public ResponseEntity<?> generateFlashcards(
            @RequestBody StudyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");
        if (request.getFile_name() == null || request.getFile_name().isBlank()) {
            return ResponseEntity.badRequest().body("Thiếu file_name!");
        }

        String result = studyService.generateFlashcards(
                request.getFile_name(),
                userDetails.getUsername()
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/feynman")
    public ResponseEntity<?> evaluateFeynman(
            @RequestBody StudyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");
        if (request.getFile_name() == null || request.getFile_name().isBlank()) {
            return ResponseEntity.badRequest().body("Thiếu file_name!");
        }
        if (request.getStudent_message() == null || request.getStudent_message().isBlank()) {
            return ResponseEntity.badRequest().body("Thiếu student_message!");
        }

        String result = studyService.evaluateFeynman(
                request.getFile_name(),
                userDetails.getUsername(),
                request.getStudent_message()
        );
        return ResponseEntity.ok(result);
    }
}
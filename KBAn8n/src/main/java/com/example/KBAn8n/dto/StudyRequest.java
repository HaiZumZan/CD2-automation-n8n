package com.example.KBAn8n.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyRequest {
    private String file_name;
    private String student_message; // null nếu là flashcard
}
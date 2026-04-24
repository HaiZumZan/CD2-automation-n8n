package com.example.KBAn8n.service;

import com.example.KBAn8n.entity.FileMetadata;
import com.example.KBAn8n.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {
    private final FileRepository fileRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${n8n.webhook.url}")
    String n8nUrl ;


    public List<FileMetadata> getFilesForUser(String username, boolean isAdmin) {
        if (isAdmin || "admin".equals(username)) {
            return fileRepository.findAll();
        }

        return fileRepository.findAll().stream()
                .filter(f -> f.getOwnerUsername().equals(username) || f.isGlobal())
                .collect(Collectors.toList());
    }
    public List<FileMetadata> getLibraryFiles(String faculty, String major, String subject) {
        // Trả về danh sách tài liệu chung, đúng chuyên ngành
        return fileRepository.findByIsGlobalTrueAndFacultyAndMajorAndSubject(faculty, major, subject);
    }

    public List<FileMetadata> getPersonalFiles(String username) {
        // Chỉ trả về tài liệu cá nhân của user đó
        return fileRepository.findByOwnerUsernameAndIsGlobalFalse(username);
    }

    public void deleteFile(Long id, String username, boolean isAdmin) {
        FileMetadata file = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File không tồn tại"));

        if (!isAdmin && !"admin".equals(username) && !file.getOwnerUsername().equals(username)) {
            throw new RuntimeException("Bạn không có quyền xóa file của người khác!");
        }

        try {

            String url = UriComponentsBuilder.fromHttpUrl(n8nUrl)
                    .queryParam("task", "delete")
                    .queryParam("file_name", file.getFileName())
                    .queryParam("owner_username", file.getOwnerUsername())
                    .toUriString();

            System.out.println("--- [DEBUG] Đang gọi n8n để xóa tài liệu: " + file.getFileName());

            restTemplate.postForEntity(url, null, String.class);

            fileRepository.delete(file);

        } catch (Exception e) {
            System.err.println("Lỗi kết nối n8n: " + e.getMessage());
            throw new RuntimeException("Không thể gọi n8n để xóa dữ liệu AI. Vui lòng kiểm tra ngrok!");
        }
    }
}
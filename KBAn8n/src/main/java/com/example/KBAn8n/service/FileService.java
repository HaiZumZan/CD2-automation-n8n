package com.example.KBAn8n.service;

import com.example.KBAn8n.entity.FileMetadata;
import com.example.KBAn8n.repository.FileRepository;
import lombok.RequiredArgsConstructor;
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

    // SỬA: Lấy file của mình HOẶC file công khai
    public List<FileMetadata> getFilesForUser(String username, boolean isAdmin) {
        if (isAdmin || "admin".equals(username)) {
            return fileRepository.findAll();
        }

        // Lấy tất cả và lọc (Hoặc Hoa dùng query trong Repository đã tạo ở bước trước)
        return fileRepository.findAll().stream()
                .filter(f -> f.getOwnerUsername().equals(username) || f.isGlobal())
                .collect(Collectors.toList());
    }

    public void deleteFile(Long id, String username, boolean isAdmin) {
        FileMetadata file = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File không tồn tại"));

        // Kiểm tra quyền: Chỉ admin hoặc chủ sở hữu mới được xóa
        if (!isAdmin && !"admin".equals(username) && !file.getOwnerUsername().equals(username)) {
            throw new RuntimeException("Bạn không có quyền xóa file của người khác!");
        }

        try {
            // Gửi lệnh xóa sang n8n để n8n xóa Vector trong bảng documents
            String url = UriComponentsBuilder.fromHttpUrl("http://localhost:1234/webhook/knowledge-base")
                    .queryParam("task", "delete")
                    .queryParam("file_name", file.getFileName())
                    .queryParam("owner_username", file.getOwnerUsername())
                    .toUriString();

            restTemplate.postForEntity(url, null, String.class);

            // Xóa dòng quản lý trong bảng file_metadata
            fileRepository.delete(file);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi kết nối với n8n để xóa dữ liệu AI: " + e.getMessage());
        }
    }
}
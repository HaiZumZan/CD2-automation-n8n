package com.example.KBAn8n.controller;

import com.example.KBAn8n.entity.FileMetadata;
import com.example.KBAn8n.repository.FileRepository;
import com.example.KBAn8n.service.FileService;
import com.example.KBAn8n.service.N8nService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileRepository fileRepository;
    private final N8nService n8nService;
    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("isGlobal") boolean isGlobalFromRequest,
            @RequestParam("task") String task,
            // 1. THÊM 3 DÒNG NÀY ĐỂ HỨNG DỮ LIỆU TỪ REACT GỬI SANG:
            @RequestParam(value = "faculty", required = false) String faculty,
            @RequestParam(value = "major", required = false) String major,
            @RequestParam(value = "subject", required = false) String subject,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");
        String username = userDetails.getUsername();
        boolean finalGlobal = "admin".equals(username) ? true : isGlobalFromRequest;

        // KIỂM TRA FILE ĐÃ TỒN TẠI CHƯA
        if (fileRepository.existsByFileName(file.getOriginalFilename())) {
            return ResponseEntity.status(400).body("Tài liệu đã tồn tại, hãy đăng tải tài liệu khác!");
        }

        // 1. Lưu file vật lý
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String filePathString = uploadDir + file.getOriginalFilename();
        File destFile = new File(filePathString);
        file.transferTo(destFile);

        // 2. LƯU METADATA (Cập nhật lưu thêm Khoa/Ngành/Môn vào DB)
        FileMetadata meta = FileMetadata.builder()
                .fileName(file.getOriginalFilename())
                .ownerUsername(username)
                .isGlobal(finalGlobal)
                .uploadDate(LocalDateTime.now())
                .filePath(filePathString)
                .faculty(faculty) // LƯU VÀO DB ĐỂ THƯ VIỆN CÓ THỂ TÌM KIẾM
                .major(major)     // LƯU VÀO DB
                .subject(subject) // LƯU VÀO DB
                .build();
        FileMetadata savedMeta = fileRepository.save(meta); // Lưu để lấy ID
        n8nService.sendFileToN8n(destFile, username, finalGlobal, task, faculty, major, subject, String.valueOf(savedMeta.getId()));

        return ResponseEntity.ok("Tải lên thành công!");
    }

    // HÀM DOWNLOAD ĐÃ FIX LỖI ĐỎ
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        try {
            // 1. Lấy thông tin từ DB
            FileMetadata metadata = fileRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy file"));

            // 2. Đọc file từ đường dẫn đã lưu
            Path path = Paths.get(metadata.getFilePath());
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("File không tồn tại trên hệ thống!");
            }

            // 3. Trả về cho trình duyệt
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    // API XEM TRƯỚC TÀI LIỆU
    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource> previewFile(@PathVariable Long id) {
        try {
            FileMetadata metadata = fileRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy file"));

            Path path = Paths.get(metadata.getFilePath());
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("File không tồn tại trên hệ thống!");
            }

            // QUAN TRỌNG: Dùng "inline" để trình duyệt hiển thị thay vì tải về
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + metadata.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getFiles(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");
        String username = userDetails.getUsername();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) || "admin".equals(username);
        return ResponseEntity.ok(fileService.getFilesForUser(username, isAdmin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");
        boolean isAdmin = "admin".equals(userDetails.getUsername());
        fileService.deleteFile(id, userDetails.getUsername(), isAdmin);
        return ResponseEntity.ok("Xóa thành công");
    }
    // 1. API cho trang Thư Viện Chung (Bất kỳ sinh viên nào đăng nhập cũng xem được)
    @GetMapping("/library")
    public ResponseEntity<?> getLibraryFiles(
            @RequestParam String faculty,
            @RequestParam String major,
            @RequestParam String subject,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");

        List<FileMetadata> files = fileService.getLibraryFiles(faculty, major, subject);
        return ResponseEntity.ok(files);
    }

    // 2. API cho Không gian cá nhân (Chỉ xem file của chính mình)
    @GetMapping("/personal")
    public ResponseEntity<?> getPersonalFiles(@AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");

        String username = userDetails.getUsername();
        List<FileMetadata> files = fileService.getPersonalFiles(username);
        return ResponseEntity.ok(files);
    }
    // --- API DÀNH RIÊNG CHO N8N TRẢ KẾT QUẢ AI ---
    @PostMapping("/webhook/n8n-result/{fileId}")
    public ResponseEntity<?> receiveAiResult(
            @PathVariable Long fileId,
            @RequestBody java.util.Map<String, String> aiData) {

        try {
            // 1. Tìm file trong DB
            FileMetadata file = fileRepository.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy file ID: " + fileId));

            // 2. Lấy dữ liệu n8n gửi sang
            String summary = aiData.get("summary");
            String keywords = aiData.get("keywords");

            // 3. Cập nhật và lưu lại
            file.setSummary(summary);
            file.setKeywords(keywords);
            fileRepository.save(file);

            System.out.println("✅ Đã nhận bản tóm tắt từ n8n cho file: " + file.getFileName());
// Thay dòng cũ:
// return ResponseEntity.ok("Cập nhật AI Metadata thành công!");

// Bằng dòng mới này:
            return ResponseEntity.ok(java.util.Map.of("message", "Cập nhật AI Metadata thành công!"));
        } catch (Exception e) {
            System.err.println(" Lỗi khi nhận dữ liệu từ n8n: " + e.getMessage());
// Thay dòng cũ:
// return ResponseEntity.internalServerError().body("Lỗi server");

// Bằng dòng mới này:
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", "Lỗi server"));        }
    }


    // Thêm vào FileController.java
    @GetMapping("/study")
    public ResponseEntity<?> getFilesForStudy(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");
        String username = userDetails.getUsername();
        List<FileMetadata> files = fileService.getFilesForStudy(username);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/flashcard-files")
    public ResponseEntity<?> getFilesForFlashcard(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).body("Token lỗi!");

        String username = userDetails.getUsername();
        List<FileMetadata> files = fileService.getFilesForFlashcard(username);
        return ResponseEntity.ok(files);
    }

}
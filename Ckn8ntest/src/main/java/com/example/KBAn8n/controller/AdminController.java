package com.example.KBAn8n.controller;

import com.example.KBAn8n.entity.User; // Đổi lại đúng đường dẫn Entity của bạn
import com.example.KBAn8n.repository.UserRepository; // Đổi lại đúng đường dẫn Repository của bạn
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    // 1. Lấy danh sách toàn bộ người dùng
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 2. API Khóa / Mở khóa tài khoản
    @PutMapping("/toggle-lock/{username}")
    public ResponseEntity<?> toggleUserLock(@PathVariable String username) {
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không tìm thấy người dùng!"));
        }

        // Kiểm tra không cho phép khóa chính tài khoản Admin gốc
        if (user.getRole().equals("ADMIN") || user.getRole().equals("ROLE_ADMIN")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể khóa tài khoản Quản trị viên!"));
        }

        // Đảo ngược trạng thái khóa (Nếu đang active thì khóa, nếu đang khóa thì mở)
        // LƯU Ý: Nếu Entity User của bạn có thuộc tính 'enabled' thì dùng setEnabled.
        // Nếu có 'locked' thì dùng setLocked. Ở đây mình ví dụ là setEnabled.
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật trạng thái thành công!",
                "isEnabled", user.isEnabled()
        ));
    }
}
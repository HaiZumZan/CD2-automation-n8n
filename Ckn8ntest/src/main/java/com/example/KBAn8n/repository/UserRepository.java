package com.example.KBAn8n.repository;

import com.example.KBAn8n.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring sẽ tự động tạo câu lệnh SQL: SELECT count(*) > 0 FROM users WHERE username = ?
    boolean existsByUsername(String username);

    // Phương thức tìm kiếm user để login (bạn chắc chắn đã có dòng này rồi)
    Optional<User> findByUsername(String username);
}
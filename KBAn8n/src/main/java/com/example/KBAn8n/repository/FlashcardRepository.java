package com.example.KBAn8n.repository;

import com.example.KBAn8n.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByUsernameAndFileName(String username, String fileName);

    @Query("SELECT DISTINCT f.fileName FROM Flashcard f WHERE f.username = :username")
    List<String> findDistinctFileNamesByUsername(@Param("username") String username);
}

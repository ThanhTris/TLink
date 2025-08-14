package com.example.backend.repository;

import com.example.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Nếu có method như findByUser thì đổi thành findByAuthor
    // Ví dụ:
    // List<Post> findByAuthor(User author);
}

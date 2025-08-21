package com.example.backend.repository;

import com.example.backend.entity.PostFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostFileRepository extends JpaRepository<PostFile, Long> {
    // Có thể thêm các hàm custom nếu cần

    PostFile findByPostId(Long postId);
}

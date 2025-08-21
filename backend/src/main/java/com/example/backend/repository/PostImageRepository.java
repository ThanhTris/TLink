package com.example.backend.repository;

import com.example.backend.entity.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    // Có thể thêm các hàm custom nếu cần
    
    public PostImage findByPostId(Long postId);
   
}

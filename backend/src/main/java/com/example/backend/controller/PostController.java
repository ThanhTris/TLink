package com.example.backend.controller;

import com.example.backend.dto.request.PostCreateRequestDTO;
import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponseDTO> createPost(@RequestBody PostCreateRequestDTO request) {
        ApiResponseDTO response = postService.createPost(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> updatePost(@PathVariable Long id, @RequestBody PostCreateRequestDTO request) {
        ApiResponseDTO response = postService.updatePost(id, request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> deletePost(@PathVariable Long id) {
        ApiResponseDTO response = postService.deletePost(id);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/category")
    public ResponseEntity<ApiResponseDTO> getPostsByCategory(
            @RequestParam String categoryPath,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(required = false) Long userId 
    ) {
        ApiResponseDTO response = postService.getPostsByCategory(categoryPath, limit, offset, userId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponseDTO> likePost(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        try {
            ApiResponseDTO response = postService.likePost(id, userId);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(response);
        } catch (Exception ex) {
            // Luôn trả về JSON lỗi, không trả về lỗi 500 HTML
            ApiResponseDTO response = new ApiResponseDTO(false, "Lỗi hệ thống: " + ex.getMessage(), null, "INTERNAL_ERROR");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/{id}/unlike")
    public ResponseEntity<ApiResponseDTO> unlikePost(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        try {
            ApiResponseDTO response = postService.unlikePost(id, userId);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(response);
        } catch (Exception ex) {
            ApiResponseDTO response = new ApiResponseDTO(false, "Lỗi hệ thống: " + ex.getMessage(), null, "INTERNAL_ERROR");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponseDTO> searchPosts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset
    ) {
        ApiResponseDTO response = postService.searchPosts(keyword, limit, offset);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/{id}/comment-count")
    public ResponseEntity<ApiResponseDTO> getCommentCount(@PathVariable Long id) {
        ApiResponseDTO response = postService.getCommentCountForPost(id);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }
}

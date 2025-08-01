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
}

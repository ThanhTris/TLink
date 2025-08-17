package com.example.backend.controller;

import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.dto.request.CommentCreateRequestDTO;
import com.example.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<ApiResponseDTO> addComment(@RequestBody CommentCreateRequestDTO request) {
        ApiResponseDTO response = commentService.addComment(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponseDTO> likeComment(
            @PathVariable Long id,
            @RequestParam Long likerId
    ) {
        ApiResponseDTO response = commentService.likeComment(id, likerId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/{id}/unlike")
    public ResponseEntity<ApiResponseDTO> unlikeComment(
            @PathVariable Long id,
            @RequestParam Long likerId
    ) {
        ApiResponseDTO response = commentService.unlikeComment(id, likerId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // Sửa bình luận
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> updateComment(
            @PathVariable Long id,
            @RequestParam Long authorId,
            @RequestBody Map<String, String> body
    ) {
        String content = body.get("content");
        ApiResponseDTO response = commentService.updateComment(id, authorId, content);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // Xóa bình luận
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> deleteComment(
            @PathVariable Long id,
            @RequestParam Long authorId
    ) {
        ApiResponseDTO response = commentService.deleteComment(id, authorId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/tree")
    public ResponseEntity<ApiResponseDTO> getCommentsTree(@RequestParam Long postId) {
        ApiResponseDTO response = commentService.getCommentsTree(postId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }
}

package com.example.backend.controller;

import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.dto.request.CommentCreateRequestDTO;
import com.example.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam Long userId
    ) {
        ApiResponseDTO response = commentService.likeComment(id, userId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/{id}/unlike")
    public ResponseEntity<ApiResponseDTO> unlikeComment(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        ApiResponseDTO response = commentService.unlikeComment(id, userId);
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

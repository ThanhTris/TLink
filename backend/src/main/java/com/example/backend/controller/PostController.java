package com.example.backend.controller;

import com.example.backend.dto.request.PostCreateRequestDTO;
import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

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
        // Đã dùng service với stored procedure mới
        ApiResponseDTO response = postService.updatePost(id, request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> deletePost(@PathVariable Long id) {
        // Đã dùng service với stored procedure mới
        ApiResponseDTO response = postService.deletePost(id);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/category")
    public ResponseEntity<ApiResponseDTO> getPostsByCategory(
            @RequestParam String categoryPath,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(required = false) Long userId // truyền userId để kiểm tra is_liked
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
            // Đã dùng service với stored procedure mới
            ApiResponseDTO response = postService.likePost(id, userId);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(response);
        } catch (Exception ex) {
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
            // Đã dùng service với stored procedure mới
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
            @RequestParam(defaultValue = "0") Integer offset,
            @RequestParam Long userId
    ) {
        ApiResponseDTO response = postService.searchPosts(keyword, limit, offset, userId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/{id}/comment-count")
    public ResponseEntity<ApiResponseDTO> getCommentCount(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId // truyền userId nếu cần kiểm tra like comment
    ) {
        ApiResponseDTO response = postService.getCommentCountForPost(id /*, userId nếu muốn mở rộng*/);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // Upload image for a post (max 5MB)
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<ApiResponseDTO> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption
    ) {
        try {
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(
                    new ApiResponseDTO(false, "Ảnh vượt quá 5MB", null, "IMAGE_TOO_LARGE")
                );
            }
            ApiResponseDTO response = postService.savePostImage(id, file, caption);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(
                new ApiResponseDTO(false, "Lỗi upload ảnh: " + ex.getMessage(), null, "UPLOAD_IMAGE_ERROR")
            );
        }
    }

    // API trả ảnh cho frontend
    @GetMapping("/image/{imageId}")
    public ResponseEntity<byte[]> getPostImage(@PathVariable Long imageId) {
        try {
            var imageOpt = postService.getPostImageById(imageId);
            if (imageOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            var img = imageOpt.get();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(img.getImageType()));
            headers.setContentLength(img.getImageSize());
            headers.setContentDisposition(ContentDisposition.inline().filename(img.getImageName()).build());
            return new ResponseEntity<>(img.getImageData(), headers, HttpStatus.OK);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Upload file cho post (max 5MB)
    @PostMapping("/{id}/upload-file")
    public ResponseEntity<ApiResponseDTO> uploadFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(
                    new ApiResponseDTO(false, "File vượt quá 5MB", null, "FILE_TOO_LARGE")
                );
            }
            ApiResponseDTO response = postService.savePostFile(id, file);
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(
                new ApiResponseDTO(false, "Lỗi upload file: " + ex.getMessage(), null, "UPLOAD_FILE_ERROR")
            );
        }
    }

    // API trả file cho frontend
    @GetMapping("/file/{fileId}")
    public ResponseEntity<byte[]> getPostFile(@PathVariable Long fileId) {
        try {
            var fileOpt = postService.getPostFileById(fileId);
            if (fileOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            var f = fileOpt.get();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(f.getFileType()));
            headers.setContentLength(f.getFileSize());
            headers.setContentDisposition(ContentDisposition.attachment().filename(f.getFileName()).build());
            return new ResponseEntity<>(f.getFileData(), headers, HttpStatus.OK);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<ApiResponseDTO> savePost(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        ApiResponseDTO response = postService.savePost(id, userId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/{id}/unsave")
    public ResponseEntity<ApiResponseDTO> unsavePost(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        ApiResponseDTO response = postService.unsavePost(id, userId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }
}


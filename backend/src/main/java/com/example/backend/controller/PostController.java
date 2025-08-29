package com.example.backend.controller;

import com.example.backend.dto.request.PostCreateRequestDTO;
import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.dto.response.PostImageDTO;
import com.example.backend.dto.response.PostFileDTO;
import com.example.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.text.Normalizer;
import java.util.regex.Pattern;

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
            @RequestParam(required = false) Long userId // truyền userId để kiểm tra is_liked, is_saved
    ) {
        // categoryPath là code hoặc path FE (ví dụ: /general, /general/intro, dev, web, ...)
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
    if (file.getSize() > 5 * 1024 * 1024) {
        return ResponseEntity.badRequest().body(
            new ApiResponseDTO(false, "Ảnh vượt quá 5MB", null, "IMAGE_TOO_LARGE")
        );
    }
    try {
        ApiResponseDTO response = postService.savePostImage(id, file);
        // In ra message lỗi nếu có
        if (!response.isSuccess()) {
            System.err.println("UPLOAD IMAGE ERROR: " + response.getMessage());
        }
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    } catch (Exception ex) {
        String msg = extractRootCauseMessage(ex);
        System.err.println("UPLOAD IMAGE EXCEPTION: " + msg);
        return ResponseEntity.badRequest().body(
            new ApiResponseDTO(false, msg != null ? msg : ex.getMessage(), null, "UPLOAD_IMAGE_ERROR")
        );
    }
}

    // Helper để lấy message nghiệp vụ từ exception (copy từ service)
    private String extractRootCauseMessage(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        String msg = cause.getMessage();
        if (msg != null && msg.contains("MESSAGE_TEXT = '")) {
            int idx = msg.indexOf("MESSAGE_TEXT = '");
            if (idx != -1) {
                int start = idx + "MESSAGE_TEXT = '".length();
                int end = msg.indexOf("'", start);
                if (end > start) {
                    return msg.substring(start, end);
                }
            }
        }
        return msg;
    }

    private String toAsciiFileName(String fileName) {
        String normalized = Normalizer.normalize(fileName, Normalizer.Form.NFD);
        String ascii = normalized.replaceAll("[^\\p{ASCII}]", "");
        // Loại bỏ ký tự không hợp lệ cho tên file nếu cần
        ascii = ascii.replaceAll("[\\\\/:*?\"<>|]", "_");
        return ascii;
    }

    private String toContentDispositionFilename(String fileName) {
        // Encode tên file theo RFC 5987 để hỗ trợ Unicode (tiếng Việt, ký tự đặc biệt)
        // Ví dụ: filename*=UTF-8''ten%20tieng%20viet.pdf
        try {
            String encoded = java.net.URLEncoder.encode(fileName, java.nio.charset.StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");
            return "UTF-8''" + encoded;
        } catch (Exception e) {
            // Fallback ASCII nếu lỗi
            return toAsciiFileName(fileName);
        }
    }

    // API trả ảnh cho frontend (trả về ApiResponseDTO, FE sẽ lấy dữ liệu base64 hoặc binary từ trường data)
    @GetMapping("/image/{imageId}")
    public ResponseEntity<byte[]> getPostImage(@PathVariable Long imageId) {
        ApiResponseDTO response = postService.getPostImageById(imageId);
        if (!response.isSuccess() || response.getData() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        PostImageDTO dto = (PostImageDTO) response.getData();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(dto.getImageType()));
        // Dùng filename* để hỗ trợ Unicode
        headers.add(HttpHeaders.CONTENT_DISPOSITION,
            "inline; filename=\"" + toAsciiFileName(dto.getImageName()) + "\"; filename*=UTF-8''" + java.net.URLEncoder.encode(dto.getImageName(), java.nio.charset.StandardCharsets.UTF_8).replaceAll("\\+", "%20"));
        return new ResponseEntity<>(dto.getImageData(), headers, HttpStatus.OK);
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

    // API trả file cho frontend (trả về file binary, giống như ảnh)
    @GetMapping("/file/{fileId}")
    public ResponseEntity<byte[]> getPostFile(@PathVariable Long fileId) {
        ApiResponseDTO response = postService.getPostFileById(fileId);
        if (!response.isSuccess() || response.getData() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        PostFileDTO dto = (PostFileDTO) response.getData();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(dto.getFileType()));
        // Dùng filename* để hỗ trợ Unicode
        headers.add(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + toAsciiFileName(dto.getFileName()) + "\"; filename*=UTF-8''" + java.net.URLEncoder.encode(dto.getFileName(), java.nio.charset.StandardCharsets.UTF_8).replaceAll("\\+", "%20"));
        return new ResponseEntity<>(dto.getFileData(), headers, HttpStatus.OK);
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

    // API lấy bài viết theo user (bao gồm ảnh/file)
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponseDTO> getPostsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(required = false) Long viewerId // user đang xem (để kiểm tra is_liked, is_saved)
    ) {
        ApiResponseDTO response = postService.getPostsByUser(userId, limit, offset, viewerId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // API: Đếm tổng số bài viết cho home hoặc popular
    @GetMapping("/count/home-popular")
    public ResponseEntity<ApiResponseDTO> countPostsHomePopular() {
        ApiResponseDTO response = postService.countPostsHomePopular();
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // API: Đếm tổng số bài viết đã lưu của user
    @GetMapping("/count/saved")
    public ResponseEntity<ApiResponseDTO> countPostsSaved(@RequestParam Long userId) {
        ApiResponseDTO response = postService.countPostsSaved(userId);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // API: Đếm tổng số bài viết theo tag cha
    @GetMapping("/count/parent-tag")
    public ResponseEntity<ApiResponseDTO> countPostsByParentTag(@RequestParam String parentTag) {
        // parentTag là code
        ApiResponseDTO response = postService.countPostsByParentTag(parentTag);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // API: Đếm tổng số bài viết theo tag con
    @GetMapping("/count/child-tag")
    public ResponseEntity<ApiResponseDTO> countPostsByChildTag(@RequestParam String childTag) {
        // childTag là code
        ApiResponseDTO response = postService.countPostsByChildTag(childTag);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // API: Đếm tổng số bài viết theo từ khóa tìm kiếm
    @GetMapping("/count/search")
    public ResponseEntity<ApiResponseDTO> countPostsBySearch(@RequestParam String keyword) {
        ApiResponseDTO response = postService.countPostsBySearch(keyword);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // API: Đề xuất bài viết cho user
    @GetMapping("/recommend")
    public ResponseEntity<ApiResponseDTO> getRecommendedPosts(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        ApiResponseDTO response;
        if (userId == null) {
            // Nếu chưa đăng nhập, trả về bài viết phổ biến (popular)
            response = postService.getPostsByCategory("/popular", limit, offset, null);
        } else {
            // SP sẽ luôn trả về tối đa 5 bài viết mới nhất
            response = postService.getRecommendedPosts(userId, limit, offset);
        }
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }
}

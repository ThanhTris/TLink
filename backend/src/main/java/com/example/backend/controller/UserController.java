package com.example.backend.controller;

import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.dto.request.ChangePasswordRequestDTO;
import com.example.backend.dto.request.UpdateUserRequestDTO;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // For development, in production restrict to your frontend domain
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> getUserById(@PathVariable Long id) {
        ApiResponseDTO response = userService.getUserById(id);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND).body(response);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<ApiResponseDTO> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequestDTO request
    ) {
        ApiResponseDTO response = userService.changePassword(
            id,
            request.getCurrentPassword(),
            request.getNewPassword(),
            request.getConfirmPassword()
        );
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST).body(response);
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<ApiResponseDTO> getUserPosts(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer offset,
            @RequestParam(required = false) Long viewerId // user đang xem để kiểm tra is_liked, is_saved
    ) {
        ApiResponseDTO response = userService.getUserPosts(id, limit, offset, viewerId);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequestDTO request 
    ) {
        ApiResponseDTO response = userService.updateUser(id, request);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST).body(response);
    }
}


package com.example.backend.controller;

import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.dto.request.ForgotPasswordRequestDTO;
import com.example.backend.dto.request.LoginRequestDTO;
import com.example.backend.dto.request.RegisterRequestDTO;
import com.example.backend.dto.request.ResetPasswordRequestDTO;
import com.example.backend.dto.request.VerifyOtpRequestDTO;
import com.example.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        ApiResponseDTO response = authService.register(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<ApiResponseDTO> verifyOtp(@RequestBody VerifyOtpRequestDTO request) {
        ApiResponseDTO response = authService.verifyOtp(request.getEmail(), request.getOtp());
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<ApiResponseDTO> login(@RequestBody LoginRequestDTO request) {
        ApiResponseDTO response = authService.login(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(response);
    }

    // Quên mật khẩu
    @PostMapping("/login/forgot-password")
    public ResponseEntity<ApiResponseDTO> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        ApiResponseDTO response = authService.forgotPassword(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // Đổi mật khẩu mới sau khi xác thực OTP
    @PostMapping("/login/reset-password")
    public ResponseEntity<ApiResponseDTO> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        ApiResponseDTO response = authService.resetPassword(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // Đăng nhập bằng Google (FE gửi email đã xác thực)
    @PostMapping("/login/google")
    public ResponseEntity<ApiResponseDTO> loginWithGoogle(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        ApiResponseDTO response = authService.loginWithGoogleEmail(email);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(response);
    }

    // Đăng nhập bằng Facebook (FE gửi email đã xác thực)
    @PostMapping("/login/facebook")
    public ResponseEntity<ApiResponseDTO> loginWithFacebook(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        ApiResponseDTO response = authService.loginWithFacebookEmail(email);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(response);
    }

}


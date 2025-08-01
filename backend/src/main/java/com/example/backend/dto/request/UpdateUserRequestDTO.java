package com.example.backend.dto.request;

import org.springframework.web.multipart.MultipartFile;

public class UpdateUserRequestDTO {
    private String name;
    private String gender;
    private String dateOfBirth;
    private String phone;
    private String email;
    private Boolean emailOtpVerified; // true nếu đã xác thực OTP cho email mới
    private MultipartFile avatar;
    private String passwordHash; // mật khẩu xác thực khi update

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getEmailOtpVerified() {
        return emailOtpVerified;
    }

    public void setEmailOtpVerified(Boolean emailOtpVerified) {
        this.emailOtpVerified = emailOtpVerified;
    }

    public MultipartFile getAvatar() {
        return avatar;
    }

    public void setAvatar(MultipartFile avatar) {
        this.avatar = avatar;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
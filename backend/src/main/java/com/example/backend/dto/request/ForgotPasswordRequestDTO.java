package com.example.backend.dto.request;

public class ForgotPasswordRequestDTO {
    private String emailOrPhone;

    public String getEmailOrPhone() {
        return emailOrPhone;
    }
    public void setEmailOrPhone(String emailOrPhone) {
        this.emailOrPhone = emailOrPhone;
    }
}

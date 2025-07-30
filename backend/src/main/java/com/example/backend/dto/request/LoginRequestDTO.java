package com.example.backend.dto.request;

public class LoginRequestDTO {
    private String emailOrPhone;
    private String password;

    public String getEmailOrPhone() {
        return emailOrPhone;
    }
    public void setEmailOrPhone(String emailOrPhone) {
        this.emailOrPhone = emailOrPhone;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
}

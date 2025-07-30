package com.example.backend.dto.request;

public class ResetPasswordRequestDTO {
    private String emailOrPhone;
    private String otp;
    private String newPassword;

    public String getEmailOrPhone() {
        return emailOrPhone;
    }
    public void setEmailOrPhone(String emailOrPhone) {
        this.emailOrPhone = emailOrPhone;
    }
    public String getOtp() {
        return otp;
    }
    public void setOtp(String otp) {
        this.otp = otp;
    }
    public String getNewPassword() {
        return newPassword;
    }
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

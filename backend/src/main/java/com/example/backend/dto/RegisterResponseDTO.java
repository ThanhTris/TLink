package com.example.backend.dto;

public class RegisterResponseDTO {
    private boolean success;
    private String message;
    private boolean requireOTP;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRequireOTP() {
        return requireOTP;
    }

    public void setRequireOTP(boolean requireOTP) {
        this.requireOTP = requireOTP;
    }
}

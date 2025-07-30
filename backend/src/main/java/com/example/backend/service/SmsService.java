package com.example.backend.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {
    public void sendOtpSms(String phoneNumber, String otp) {
        // Giả lập gửi SMS, thực tế tích hợp với nhà cung cấp SMS như Twilio, Viettel, v.v.
        System.out.println("Gửi OTP " + otp + " tới số điện thoại: " + phoneNumber);
        // Nếu tích hợp thật, gọi API ở đây.
    }
}

package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("IT Forum - Mã xác thực đăng ký");
        message.setText("Kính gửi thành viên,\n\n" +
                "Cảm ơn bạn đã đăng ký tài khoản tại IT Forum. " +
                "Mã xác thực OTP của bạn là: " + otp + "\n\n" +
                "Mã này có hiệu lực trong vòng 5 phút.\n\n" +
                "Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n" +
                "Trân trọng,\nIT Forum Team");
        
        mailSender.send(message);
    }
}

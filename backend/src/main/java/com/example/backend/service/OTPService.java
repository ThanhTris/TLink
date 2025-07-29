package com.example.backend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OTPService {
    
    private static final long OTP_VALID_DURATION = 5 * 60 * 1000; // 5 minutes
    
    // In-memory OTP storage (in a production environment, use Redis or a database)
    private Map<String, OTPInfo> otpMap = new HashMap<>();
    
    public String generateOTP(String key) {
        // Generate a 6-digit OTP
        Random random = new Random();
        String otp = String.format("%06d", random.nextInt(999999));
        
        // Store OTP with creation time
        otpMap.put(key, new OTPInfo(otp, System.currentTimeMillis()));
        
        return otp;
    }
    
    public boolean validateOTP(String key, String otp) {
        // Check if OTP exists
        OTPInfo otpInfo = otpMap.get(key);
        if (otpInfo == null) {
            return false;
        }
        
        // Check if OTP has expired
        long currentTimeInMillis = System.currentTimeMillis();
        if (otpInfo.getTimestamp() + OTP_VALID_DURATION < currentTimeInMillis) {
            // OTP expired, remove it
            otpMap.remove(key);
            return false;
        }
        
        // Check if OTP matches
        boolean isValid = otpInfo.getOtp().equals(otp);
        
        // Remove OTP after validation
        if (isValid) {
            otpMap.remove(key);
        }
        
        return isValid;
    }
    
    // Inner class to store OTP and its creation timestamp
    private static class OTPInfo {
        private String otp;
        private long timestamp;
        
        public OTPInfo(String otp, long timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
        
        public String getOtp() {
            return otp;
        }
        
        public long getTimestamp() {
            return timestamp;
        }
    }
}

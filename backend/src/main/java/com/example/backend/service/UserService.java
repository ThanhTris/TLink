package com.example.backend.service;

import com.example.backend.dto.RegisterRequestDTO;
import com.example.backend.dto.RegisterResponseDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OTPService otpService;

    private Map<String, UserDTO> pendingRegistrations = new HashMap<>();

    public RegisterResponseDTO register(RegisterRequestDTO request) {
        RegisterResponseDTO response = new RegisterResponseDTO();

        try {
            // Determine if input is email or phone
            String input = request.getEmailOrPhone();
            boolean isEmail = input.contains("@");

            // Check if email or phone already exists
            if (isEmail) {
                if (userRepository.existsByEmail(input)) {
                    response.setSuccess(false);
                    response.setMessage("Email đã được sử dụng");
                    return response;
                }

                // Generate OTP and send email
                String otp = otpService.generateOTP(input);
                emailService.sendOtpEmail(input, otp);

                // Store registration details temporarily
                UserDTO userDTO = new UserDTO();
                userDTO.setEmail(input);
                userDTO.setName(request.getFullname());
                userDTO.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                userDTO.setGender(request.getGender());

                // Convert String to LocalDate if not null or empty
                if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
                    userDTO.setDateOfBirth(LocalDate.parse(request.getBirthday(), DateTimeFormatter.ISO_DATE));
                }

                pendingRegistrations.put(input, userDTO);

                response.setSuccess(true);
                response.setRequireOTP(true);
                response.setMessage("Mã OTP đã được gửi tới email của bạn");
            } else {
                // Phone number registration
                if (userRepository.existsByPhoneNumber(input)) {
                    response.setSuccess(false);
                    response.setMessage("Số điện thoại đã được sử dụng");
                    return response;
                }

                // Create user directly for phone registration
                User user = new User();
                user.setPhoneNumber(input);
                user.setName(request.getFullname());
                user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                user.setGender(request.getGender());
                if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
                    user.setDateOfBirth(LocalDate.parse(request.getBirthday(), DateTimeFormatter.ISO_DATE));
                }

                userRepository.save(user);

                response.setSuccess(true);
                response.setRequireOTP(false);
                response.setMessage("Đăng ký thành công");
            }

            return response;
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Lỗi đăng ký: " + e.getMessage());
            return response;
        }
    }

    @Transactional
    public RegisterResponseDTO verifyOTP(String email, String otp) {
        RegisterResponseDTO response = new RegisterResponseDTO();

        try {
            // Verify OTP
            if (!otpService.validateOTP(email, otp)) {
                response.setSuccess(false);
                response.setMessage("Mã OTP không hợp lệ hoặc đã hết hạn");
                return response;
            }

            // Get pending registration
            UserDTO userDTO = pendingRegistrations.get(email);
            if (userDTO == null) {
                response.setSuccess(false);
                response.setMessage("Không tìm thấy thông tin đăng ký");
                return response;
            }

            // Create user after OTP verification
            User user = new User();
            user.setEmail(email);
            user.setName(userDTO.getName());
            user.setPasswordHash(userDTO.getPasswordHash());
            user.setGender(userDTO.getGender());
            user.setDateOfBirth(userDTO.getDateOfBirth()); // This is now properly typed as LocalDate

            userRepository.save(user);

            // Remove from pending registrations
            pendingRegistrations.remove(email);

            response.setSuccess(true);
            response.setMessage("Xác thực thành công, đăng ký hoàn tất");
            return response;
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Lỗi xác thực: " + e.getMessage());
            return response;
        }
    }
}

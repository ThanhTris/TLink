package com.example.backend.service;

import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.dto.common.UserDTO;
import com.example.backend.dto.request.ForgotPasswordRequestDTO;
import com.example.backend.dto.request.LoginRequestDTO;
import com.example.backend.dto.request.RegisterRequestDTO;
import com.example.backend.dto.request.ResetPasswordRequestDTO;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private OTPService otpService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private SmsService smsService;

    // Lưu pending registration cho xác thực OTP
    private final Map<String, UserDTO> pendingRegistrations = new HashMap<>();

    // Map lưu trạng thái xác thực OTP cho quên mật khẩu
    private final Map<String, Boolean> forgotPasswordOtpVerified = new HashMap<>();

    public ApiResponseDTO register(RegisterRequestDTO request) {
        String input = request.getEmailOrPhone();
        boolean isEmail = input.contains("@");
        if (isEmail) {
            if (userRepository.existsByEmail(input)) {
                return new ApiResponseDTO(false, "Email đã được sử dụng", null, "EMAIL_EXISTS");
            }
            String otp = otpService.generateOTP(input);
            emailService.sendOtpEmailForRegister(input, otp);
        } else {
            if (userRepository.existsByPhoneNumber(input)) {
                return new ApiResponseDTO(false, "Số điện thoại đã được sử dụng", null, "PHONE_EXISTS");
            }
            String otp = otpService.generateOTP(input);
            smsService.sendOtpSms(input, otp);
        }
        UserDTO userDTO = new UserDTO();
        if (isEmail) userDTO.setEmail(input); else userDTO.setPhone(input);
        userDTO.setName(request.getFullname());
        userDTO.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userDTO.setGender(request.getGender());
        if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
            userDTO.setDateOfBirth(java.time.LocalDate.parse(request.getBirthday(), java.time.format.DateTimeFormatter.ISO_DATE));
        }
        pendingRegistrations.put(input, userDTO);
        return new ApiResponseDTO(true, "Mã OTP đã được gửi tới " + (isEmail ? "email" : "số điện thoại") + " của bạn", null, null);
    }

    public ApiResponseDTO verifyOtp(String emailOrPhone, String otp) {
        if (!otpService.validateOTP(emailOrPhone, otp)) {
            return new ApiResponseDTO(false, "Mã OTP không hợp lệ hoặc đã hết hạn", null, "INVALID_OTP");
        }
        UserDTO userDTO = pendingRegistrations.get(emailOrPhone);
        if (userDTO == null) {
            return new ApiResponseDTO(false, "Không tìm thấy thông tin đăng ký", null, "NO_PENDING_REGISTRATION");
        }
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setPhoneNumber(userDTO.getPhone());
        user.setName(userDTO.getName());
        user.setPasswordHash(userDTO.getPasswordHash());
        user.setGender(userDTO.getGender());
        user.setDateOfBirth(userDTO.getDateOfBirth());
        userRepository.save(user);
        pendingRegistrations.remove(emailOrPhone);
        return new ApiResponseDTO(true, "Xác thực thành công, đăng ký hoàn tất", null, null);
    }

    public ApiResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmailOrPhone())
                .orElse(userRepository.findByPhoneNumber(request.getEmailOrPhone()).orElse(null));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new ApiResponseDTO(false, "Tài khoản hoặc mật khẩu không đúng", null, "INVALID_CREDENTIALS");
        }
        // Trả về thông tin user (ẩn password) 
        return new ApiResponseDTO(true, "Đăng nhập thành công", new UserDTO(user), null);
    }

    public ApiResponseDTO forgotPassword(ForgotPasswordRequestDTO request) {
        Boolean isEmail = request.getEmailOrPhone().contains("@");

        User user = userRepository.findByEmail(request.getEmailOrPhone())
                .orElse(userRepository.findByPhoneNumber(request.getEmailOrPhone()).orElse(null));
        if (user == null) {
            return new ApiResponseDTO(false, "Không tìm thấy tài khoản", null, "USER_NOT_FOUND");
        }
        String otp = otpService.generateOTP(request.getEmailOrPhone());
        if (isEmail) {
            emailService.sendOtpEmailForForgotPassword(user.getEmail(), otp);
        } else {
            smsService.sendOtpSms(user.getPhoneNumber(), otp);
        }
        return new ApiResponseDTO(true, "Mã OTP đã được gửi tới " + (isEmail ? "email" : "số điện thoại") + " của bạn", null, null);
    }

    // Xác thực OTP cho quên mật khẩu
    public ApiResponseDTO verifyForgotPasswordOtp(String emailOrPhone, String otp) {
        if (!otpService.validateOTP(emailOrPhone, otp)) {
            return new ApiResponseDTO(false, "Mã OTP không hợp lệ hoặc đã hết hạn", null, "INVALID_OTP");
        }
        forgotPasswordOtpVerified.put(emailOrPhone, true);
        return new ApiResponseDTO(true, "Xác thực OTP thành công, bạn có thể đổi mật khẩu mới", null, null);
    }

    public ApiResponseDTO resetPassword(ResetPasswordRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmailOrPhone())
                .orElse(userRepository.findByPhoneNumber(request.getEmailOrPhone()).orElse(null));
        if (user == null) {
            return new ApiResponseDTO(false, "Không tìm thấy tài khoản", null, "USER_NOT_FOUND");
        }
        // Kiểm tra đã xác thực OTP chưa
        if (!Boolean.TRUE.equals(forgotPasswordOtpVerified.get(request.getEmailOrPhone()))) {
            return new ApiResponseDTO(false, "Bạn chưa xác thực OTP hoặc OTP đã hết hạn", null, "OTP_NOT_VERIFIED");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        forgotPasswordOtpVerified.remove(request.getEmailOrPhone());
        return new ApiResponseDTO(true, "Đổi mật khẩu thành công", null, null);
    }

    // Đăng nhập bằng Google (email)
    public ApiResponseDTO loginWithGoogle(String googleToken) {
        // Giả lập xác thực token Google, thực tế gọi Google API để xác thực và lấy email
        String email = mockVerifyGoogleTokenAndGetEmail(googleToken);
        if (email == null) {
            return new ApiResponseDTO(false, "Token Google không hợp lệ", null, "INVALID_GOOGLE_TOKEN");
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Nếu chưa có user, có thể tạo mới hoặc báo lỗi
            return new ApiResponseDTO(false, "Tài khoản Google chưa được liên kết", null, "USER_NOT_FOUND");
        }
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhoneNumber());
        userDTO.setName(user.getName());
        userDTO.setAvatar(user.getAvatar());
        userDTO.setGender(user.getGender());
        userDTO.setDateOfBirth(user.getDateOfBirth());
        return new ApiResponseDTO(true, "Đăng nhập Google thành công", userDTO, null);
    }

    // Đăng nhập bằng Facebook
    public ApiResponseDTO loginWithFacebook(String facebookToken) {
        // Giả lập xác thực token Facebook, thực tế gọi Facebook API để xác thực và lấy email
        String email = mockVerifyFacebookTokenAndGetEmail(facebookToken);
        if (email == null) {
            return new ApiResponseDTO(false, "Token Facebook không hợp lệ", null, "INVALID_FACEBOOK_TOKEN");
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Nếu chưa có user, có thể tạo mới hoặc báo lỗi
            return new ApiResponseDTO(false, "Tài khoản Facebook chưa được liên kết", null, "USER_NOT_FOUND");
        }
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhoneNumber());
        userDTO.setName(user.getName());
        userDTO.setAvatar(user.getAvatar());
        userDTO.setGender(user.getGender());
        userDTO.setDateOfBirth(user.getDateOfBirth());
        return new ApiResponseDTO(true, "Đăng nhập Facebook thành công", userDTO, null);
    }

    // Đăng nhập bằng Google (email đã xác thực ở FE)
    public ApiResponseDTO loginWithGoogleEmail(String email, String name, String avatar) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Tạo user mới nếu chưa tồn tại
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : "Google User");
            newUser.setAvatar(avatar);
            newUser.setPasswordHash(""); // Hoặc random
            userRepository.save(newUser);
            user = newUser;
        }
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhoneNumber());
        userDTO.setName(user.getName());
        userDTO.setAvatar(user.getAvatar());
        userDTO.setGender(user.getGender());
        userDTO.setDateOfBirth(user.getDateOfBirth());
        return new ApiResponseDTO(true, "Đăng nhập Google thành công", userDTO, null);
    }

    // Đăng nhập bằng Facebook (email đã xác thực ở FE)
    public ApiResponseDTO loginWithFacebookEmail(String email, String name, String avatar) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Tạo user mới nếu chưa tồn tại
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : "Facebook User");
            newUser.setAvatar(avatar);
            newUser.setPasswordHash(""); // Hoặc random
            userRepository.save(newUser);
            user = newUser;
        }
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhoneNumber());
        userDTO.setName(user.getName());
        userDTO.setAvatar(user.getAvatar());
        userDTO.setGender(user.getGender());
        userDTO.setDateOfBirth(user.getDateOfBirth());
        return new ApiResponseDTO(true, "Đăng nhập Facebook thành công", userDTO, null);
    }

    // Mock xác thực token Google/Facebook (thực tế phải gọi API của Google/Facebook)
    private String mockVerifyGoogleTokenAndGetEmail(String token) {
        // Nếu token hợp lệ, trả về email, nếu không trả về null
        if ("valid_google_token".equals(token)) {
            return "testuser@gmail.com";
        }
        return null;
    }

    private String mockVerifyFacebookTokenAndGetEmail(String token) {
        if ("valid_facebook_token".equals(token)) {
            return "testuser@gmail.com";
        }
        return null;
    }
}

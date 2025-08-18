package com.example.backend.service;

import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.dto.common.UserDTO;
import com.example.backend.dto.request.UpdateUserRequestDTO;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    // Các hàm quản lý user (get, update, delete, ...)

  
   
    @Transactional(readOnly = true)
    public ApiResponseDTO getUserById(Long userId) {
        try {
            if (userId == null) {
                return new ApiResponseDTO(false, "User ID không được để trống", null, "USER_ID_NULL");
            }
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return new ApiResponseDTO(false, "User không tồn tại", null, "USER_NOT_FOUND");
            }
            // Trả về DTO thay vì entity
            return new ApiResponseDTO(true, "Lấy thông tin user thành công", new UserDTO(user), null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi lấy thông tin user: " + ex.getMessage(), null, "GET_USER_ERROR");
        }
    }

    // Đổi mật khẩu
    @Transactional
    public ApiResponseDTO changePassword(Long userId, String currentPassword, String newPassword,
            String confirmPassword) {
        try {
            if (userId == null) {
                return new ApiResponseDTO(false, "User ID không được để trống", null, "USER_ID_NULL");
            }
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return new ApiResponseDTO(false, "User không tồn tại", null, "USER_NOT_FOUND");
            }
            if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                return new ApiResponseDTO(false, "Mật khẩu hiện tại không đúng", null, "CURRENT_PASSWORD_ERROR");
            }
            if (!newPassword.equals(confirmPassword)) {
                return new ApiResponseDTO(false, "Mật khẩu mới và xác nhận không khớp", null, "PASSWORD_CONFIRM_ERROR");
            }
            String newPasswordHash = passwordEncoder.encode(newPassword);

            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_change_user_password");
            query.registerStoredProcedureParameter("p_user_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_old_password_hash", String.class,
                    jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_new_password_hash", String.class,
                    jakarta.persistence.ParameterMode.IN);

            query.setParameter("p_user_id", userId);
            query.setParameter("p_old_password_hash", user.getPasswordHash());
            query.setParameter("p_new_password_hash", newPasswordHash);

            query.execute();
            return new ApiResponseDTO(true, "Đổi mật khẩu thành công", null, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi đổi mật khẩu: " + ex.getMessage(), null, "CHANGE_PASSWORD_ERROR");
        }
    }

    // Lấy các bài viết của user
    @Transactional
    public ApiResponseDTO getUserPosts(Long userId, Integer limit, Integer offset) {
        try {
            if (userId == null) {
                return new ApiResponseDTO(false, "User ID không được để trống", null, "USER_ID_NULL");
            }
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return new ApiResponseDTO(false, "User không tồn tại", null, "USER_NOT_FOUND");
            }
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_get_user_posts");
            query.registerStoredProcedureParameter("p_user_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_limit", Integer.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_offset", Integer.class, jakarta.persistence.ParameterMode.IN);

            query.setParameter("p_user_id", userId);
            query.setParameter("p_limit", limit);
            query.setParameter("p_offset", offset);

            List<Object[]> results = query.getResultList();
            List<Map<String, Object>> formattedResults = convertUserPostsToKeyValue(results);
            return new ApiResponseDTO(true, "Lấy bài viết của user thành công", formattedResults, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi lấy bài viết của user: " + ex.getMessage(), null,
                    "GET_USER_POSTS_ERROR");
        }
    }

    private List<Map<String, Object>> convertUserPostsToKeyValue(List<Object[]> results) {
        List<Map<String, Object>> formattedResults = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> post = new HashMap<>();
            post.put("id", row[0]);
            post.put("title", row[1]);
            post.put("content", row[2]);
            post.put("likes_count", row[3]);
            post.put("comment_count", row[4]);
            post.put("created_at", row[5]);
            post.put("user_name", row[6]);
            post.put("user_avatar", row[7]);
            formattedResults.add(post);
        }
        return formattedResults;
    }

    // Hàm duy nhất cập nhật thông tin user, xác thực bằng mật khẩu hiện tại
    @Transactional
    public ApiResponseDTO updateUser(Long userId, UpdateUserRequestDTO request) {
        try {
            if (userId == null) {
                return new ApiResponseDTO(false, "User ID không được để trống", null, "USER_ID_NULL");
            }
            if (request.getPasswordHash() == null || request.getPasswordHash().isEmpty()) {
                return new ApiResponseDTO(false, "Vui lòng nhập mật khẩu để xác thực", null, "PASSWORD_REQUIRED");
            }
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return new ApiResponseDTO(false, "User không tồn tại", null, "USER_NOT_FOUND");
            }
            if (!passwordEncoder.matches(request.getPasswordHash(), user.getPasswordHash())) {
                return new ApiResponseDTO(false, "Mật khẩu xác thực không đúng", null, "INVALID_PASSWORD");
            }

            // Update phone nếu thay đổi và chưa tồn tại
            if (request.getPhone() != null && !request.getPhone().equals(user.getPhoneNumber())) {
                if (userRepository.existsByPhoneNumber(request.getPhone())) {
                    return new ApiResponseDTO(false, "Số điện thoại đã tồn tại", null, "PHONE_EXISTS");
                }
                user.setPhoneNumber(request.getPhone());
            }

            // Update email nếu thay đổi và chưa tồn tại
            if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
                if (userRepository.existsByEmail(request.getEmail())) {
                    return new ApiResponseDTO(false, "Email đã tồn tại", null, "EMAIL_EXISTS");
                }
                user.setEmail(request.getEmail());
            }

            // Update các trường còn lại nếu thay đổi
            if (request.getName() != null && !request.getName().equals(user.getName())) {
                user.setName(request.getName());
            }
            if (request.getGender() != null && !request.getGender().equals(user.getGender())) {
                user.setGender(request.getGender());
            }
            if (request.getDateOfBirth() != null) {
                java.time.LocalDate dob = java.time.LocalDate.parse(request.getDateOfBirth());
                if (!dob.equals(user.getDateOfBirth())) {
                    user.setDateOfBirth(dob);
                }
            }
            if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
                String uploadDir = "uploads/avatars/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();
                String fileName = "avatar_" + userId + "_" + System.currentTimeMillis() + "_" + request.getAvatar().getOriginalFilename();
                File dest = new File(uploadDir + fileName);
                request.getAvatar().transferTo(dest);
                user.setAvatar(fileName);
            }

            userRepository.save(user);
            return new ApiResponseDTO(true, "Cập nhật thông tin user thành công", null, null);
        } catch (IOException ex) {
            return new ApiResponseDTO(false, "Lỗi khi upload avatar: " + ex.getMessage(), null, "UPLOAD_AVATAR_ERROR");
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi cập nhật thông tin user: " + ex.getMessage(), null, "UPDATE_USER_ERROR");
        }
    }
}

package com.example.backend.service;

import com.example.backend.dto.request.PostCreateRequestDTO;
import com.example.backend.entity.User;
import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.repository.PostRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private PostRepository postRepository;

    @Transactional
    public ApiResponseDTO createPost(PostCreateRequestDTO request) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_create_post");
            query.registerStoredProcedureParameter("p_user_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_title", String.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_content", String.class, jakarta.persistence.ParameterMode.IN);

            query.setParameter("p_user_id", request.getUserId());
            query.setParameter("p_title", request.getTitle());
            query.setParameter("p_content", request.getContent());

            query.execute();
            Object resultObj = query.getSingleResult();
            Long postId = null;
            if (resultObj instanceof Number) {
                postId = ((Number) resultObj).longValue();
            } else if (resultObj instanceof Object[]) {
                postId = ((Number) ((Object[]) resultObj)[0]).longValue();
            }

            // Gắn tag cho bài viết
            if (request.getChildTagIds() != null) {
                for (Long childTagId : request.getChildTagIds()) {
                    StoredProcedureQuery tagQuery = entityManager.createStoredProcedureQuery("sp_add_tag_to_post");
                    tagQuery.registerStoredProcedureParameter("p_post_id", Long.class, jakarta.persistence.ParameterMode.IN);
                    tagQuery.registerStoredProcedureParameter("p_child_tag_id", Long.class, jakarta.persistence.ParameterMode.IN);
                    tagQuery.setParameter("p_post_id", postId);
                    tagQuery.setParameter("p_child_tag_id", childTagId);
                    tagQuery.execute();
                }
            }

            return new ApiResponseDTO(true, "Tạo bài viết thành công", postId, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi tạo bài viết: " + ex.getMessage(), null, "CREATE_POST_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO updatePost(Long postId, PostCreateRequestDTO request) {
        try {
            // Kiểm tra postId có tồn tại không
            if (!postRepository.existsById(postId)) {
                return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
            }
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_update_post");
            query.registerStoredProcedureParameter("p_post_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_title", String.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_content", String.class, jakarta.persistence.ParameterMode.IN);

            query.setParameter("p_post_id", postId);
            query.setParameter("p_title", request.getTitle());
            query.setParameter("p_content", request.getContent());
            query.execute();

            // Xóa hết tag cũ và gắn lại tag mới (nếu cần)
            if (request.getChildTagIds() != null) {
                // Xóa tag cũ
                entityManager.createNativeQuery("DELETE FROM post_child_tags WHERE post_id = ?")
                        .setParameter(1, postId)
                        .executeUpdate();
                // Gắn lại tag mới
                for (Long childTagId : request.getChildTagIds()) {
                    StoredProcedureQuery tagQuery = entityManager.createStoredProcedureQuery("sp_add_tag_to_post");
                    tagQuery.registerStoredProcedureParameter("p_post_id", Long.class, jakarta.persistence.ParameterMode.IN);
                    tagQuery.registerStoredProcedureParameter("p_child_tag_id", Long.class, jakarta.persistence.ParameterMode.IN);
                    tagQuery.setParameter("p_post_id", postId);
                    tagQuery.setParameter("p_child_tag_id", childTagId);
                    tagQuery.execute();
                }
            }

            return new ApiResponseDTO(true, "Cập nhật bài viết thành công", postId, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi cập nhật bài viết: " + ex.getMessage(), null, "UPDATE_POST_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO deletePost(Long postId) {
        try {
            // Kiểm tra postId có tồn tại không
            if (!postRepository.existsById(postId)) {
                return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
            }
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_delete_post");
            query.registerStoredProcedureParameter("p_post_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.setParameter("p_post_id", postId);
            query.execute();

            return new ApiResponseDTO(true, "Xóa bài viết thành công", postId, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi xóa bài viết: " + ex.getMessage(), null, "DELETE_POST_ERROR");
        }
    }

    @Transactional(readOnly = true)
    public ApiResponseDTO getPostsByCategory(String categoryPath, int limit, int offset, Long userId) {
        try {
            List<Object[]> results;
            String sql;

            if ("/popular".equals(categoryPath)) {
                // Lấy bài viết theo lượt thích và comment giảm dần
                sql = "SELECT p.id, p.title, p.content, p.likes_count, p.comment_count, p.created_at, " +
                        "u.name AS user_name, u.avatar AS user_avatar " +
                        "FROM posts p " +
                        "JOIN users u ON p.user_id = u.id " +
                        "ORDER BY p.likes_count DESC, p.comment_count DESC, p.created_at DESC " +
                        "LIMIT :limit OFFSET :offset";
                results = entityManager.createNativeQuery(sql)
                        .setParameter("limit", limit)
                        .setParameter("offset", offset)
                        .getResultList();
            } else if ("/saved".equals(categoryPath)) {
                // Lấy các bài viết đã lưu của user
                if (userId == null) {
                    return new ApiResponseDTO(false, "Thiếu userId để lấy bài viết đã lưu", null, "USER_ID_REQUIRED");
                }
                User user = entityManager.find(User.class, userId);
                if (user == null) {
                    return new ApiResponseDTO(false, "User không tồn tại", null, "USER_NOT_FOUND");
                }
                sql = "SELECT p.id, p.title, p.content, p.likes_count, p.comment_count, p.created_at, " +
                        "u.name AS user_name, u.avatar AS user_avatar " +
                        "FROM posts p " +
                        "JOIN users u ON p.user_id = u.id " +
                        "JOIN post_saves ps ON p.id = ps.post_id " +
                        "WHERE ps.user_id = :userId " +
                        "ORDER BY ps.created_at DESC " +
                        "LIMIT :limit OFFSET :offset";
                results = entityManager.createNativeQuery(sql)
                        .setParameter("userId", userId)
                        .setParameter("limit", limit)
                        .setParameter("offset", offset)
                        .getResultList();
            } else if ("/".equals(categoryPath) || "/home".equals(categoryPath)) {
                // Lấy các bài viết mới nhất
                sql = "SELECT p.id, p.title, p.content, p.likes_count, p.comment_count, p.created_at, " +
                        "u.name AS user_name, u.avatar AS user_avatar " +
                        "FROM posts p " +
                        "JOIN users u ON p.user_id = u.id " +
                        "ORDER BY p.created_at DESC " +
                        "LIMIT :limit OFFSET :offset";
                results = entityManager.createNativeQuery(sql)
                        .setParameter("limit", limit)
                        .setParameter("offset", offset)
                        .getResultList();
            } else {
                List<String> childTagNames = getChildTagsForParentCategory(categoryPath);
                if (!childTagNames.isEmpty()) {
                    sql = "SELECT DISTINCT p.id, p.title, p.content, p.likes_count, p.comment_count, p.created_at, " +
                            "u.name AS user_name, u.avatar AS user_avatar " +
                            "FROM posts p " +
                            "JOIN users u ON p.user_id = u.id " +
                            "LEFT JOIN post_child_tags pct ON p.id = pct.post_id " +
                            "LEFT JOIN child_tags ct ON pct.child_tag_id = ct.id " +
                            "WHERE ct.name IN (:tagNames) " +
                            "ORDER BY p.created_at DESC " +
                            "LIMIT :limit OFFSET :offset";
                    results = entityManager.createNativeQuery(sql)
                            .setParameter("tagNames", childTagNames)
                            .setParameter("limit", limit)
                            .setParameter("offset", offset)
                            .getResultList();
                } else {
                    String tagName = mapCategoryPathToTagName(categoryPath);
                    sql = "SELECT p.id, p.title, p.content, p.likes_count, p.comment_count, p.created_at, " +
                            "u.name AS user_name, u.avatar AS user_avatar " +
                            "FROM posts p " +
                            "JOIN users u ON p.user_id = u.id " +
                            "LEFT JOIN post_child_tags pct ON p.id = pct.post_id " +
                            "LEFT JOIN child_tags ct ON pct.child_tag_id = ct.id " +
                            "LEFT JOIN parent_tags pt ON ct.parent_tag_id = pt.id " +
                            "WHERE ct.name = :tagName OR pt.name = :tagName " +
                            "ORDER BY p.created_at DESC " +
                            "LIMIT :limit OFFSET :offset";
                    results = entityManager.createNativeQuery(sql)
                            .setParameter("tagName", tagName)
                            .setParameter("limit", limit)
                            .setParameter("offset", offset)
                            .getResultList();
                }
            }

            return new ApiResponseDTO(true, "Lấy bài viết theo category thành công", results, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi lấy bài viết theo category: " + ex.getMessage(), null, "GET_POSTS_BY_CATEGORY_ERROR");
        }
    }

    // Trả về danh sách tên các tag con cho category cha (dùng path FE)
    private List<String> getChildTagsForParentCategory(String categoryPath) {
        switch (categoryPath) {
            case "/dev":
                return List.of("Web", "Mobile", "Backend", "Frontend", "Machine Learning", "Data");
            case "/os":
                return List.of("Windows", "Linux / Ubuntu", "macOS", "Command Line", "Cài đặt hệ điều hành", "Dual Boot");
            case "/security":
                return List.of("An ninh mạng", "Hệ thống mạng", "Kiểm thử bảo mật", "Firewall / IDS", "Mã hóa & bảo vệ dữ liệu");
            case "/resources":
                return List.of("Tài liệu – Khóa học", "Chia sẻ kinh nghiệm", "Lộ trình học tập");
            case "/career":
                return List.of("Việc làm IT", "CV & phỏng vấn", "Freelance");
            case "/general":
                return List.of("Giới thiệu – Làm quen", "Chuyện ngoài IT", "Hỏi đáp linh tinh", "Thảo luận công nghệ");
            default:
                return List.of();
        }
    }

    // Map path FE sang tên tag (dùng đúng path FE)
    private String mapCategoryPathToTagName(String categoryPath) {
        switch (categoryPath) {
            case "/dev/web": return "Web";
            case "/dev/mobile": return "Mobile";
            case "/dev/backend": return "Backend";
            case "/dev/frontend": return "Frontend";
            case "/dev/ml": return "Machine Learning";
            case "/dev/data": return "Data";
            case "/os/windows": return "Windows";
            case "/os/linux": return "Linux / Ubuntu";
            case "/os/macos": return "macOS";
            case "/os/cli": return "Command Line";
            case "/os/installation": return "Cài đặt hệ điều hành";
            case "/os/dualboot": return "Dual Boot";
            case "/security/cyber": return "An ninh mạng";
            case "/security/network": return "Hệ thống mạng";
            case "/security/penetration-testing": return "Kiểm thử bảo mật";
            case "/security/firewall": return "Firewall / IDS";
            case "/security/encryption": return "Mã hóa & bảo vệ dữ liệu";
            case "/resources/courses": return "Tài liệu – Khóa học";
            case "/resources/experience": return "Chia sẻ kinh nghiệm";
            case "/resources/roadmap": return "Lộ trình học tập";
            case "/career/jobs": return "Việc làm IT";
            case "/career/cv-interview": return "CV & phỏng vấn";
            case "/career/freelance": return "Freelance";
            case "/popular": return "Phổ biến";
            case "/saved": return "Đã lưu";
            case "/general/intro": return "Giới thiệu – Làm quen";
            case "/general/off-topic": return "Chuyện ngoài IT";
            case "/general/ask-anything": return "Hỏi đáp linh tinh";
            case "/general/tech-talk": return "Thảo luận công nghệ";
            default: return categoryPath;
        }
    }
}


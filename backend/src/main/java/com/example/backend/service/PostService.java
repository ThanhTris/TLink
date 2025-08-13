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
import org.springframework.transaction.UnexpectedRollbackException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
                        "u.name AS user_name, u.avatar AS user_avatar, p.user_id " +
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
                        "u.name AS user_name, u.avatar AS user_avatar, p.user_id " +
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
                        "u.name AS user_name, u.avatar AS user_avatar, p.user_id " +
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
                            "u.name AS user_name, u.avatar AS user_avatar, p.user_id " +
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
                            "u.name AS user_name, u.avatar AS user_avatar, p.user_id " +
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

            List<Map<String, Object>> formattedResults = convertPostsToKeyValue(results);
            return new ApiResponseDTO(true, "Lấy bài viết theo category thành công", formattedResults, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi lấy bài viết theo category: " + ex.getMessage(), null, "GET_POSTS_BY_CATEGORY_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO likePost(Long postId, Long userId) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_like_post");
            query.registerStoredProcedureParameter("p_post_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_user_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.setParameter("p_post_id", postId);
            query.setParameter("p_user_id", userId);
            query.execute();
            return new ApiResponseDTO(true, "Like bài viết thành công", null, null);
        } catch (UnexpectedRollbackException urex) {
            // Extract root cause message from the exception chain
            String message = extractRootCauseMessage(urex);
            return new ApiResponseDTO(false, message, null, "LIKE_POST_ERROR");
        } catch (Exception ex) {
            String message = ex.getMessage();
            // Nếu message chứa lỗi nghiệp vụ từ SIGNAL SQLSTATE thì lấy message đó
            if (message != null && message.contains("SQLSTATE[45000]")) {
                int idx = message.indexOf("MESSAGE_TEXT = '");
                if (idx != -1) {
                    int start = idx + "MESSAGE_TEXT = '".length();
                    int end = message.indexOf("'", start);
                    if (end > start) {
                        message = message.substring(start, end);
                    }
                }
            }
            return new ApiResponseDTO(false, message, null, "LIKE_POST_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO unlikePost(Long postId, Long userId) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_unlike_post");
            query.registerStoredProcedureParameter("p_post_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_user_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.setParameter("p_post_id", postId);
            query.setParameter("p_user_id", userId);
            query.execute();
            return new ApiResponseDTO(true, "Unlike bài viết thành công", null, null);
        } catch (UnexpectedRollbackException urex) {
            String message = extractRootCauseMessage(urex);
            return new ApiResponseDTO(false, message, null, "UNLIKE_POST_ERROR");
        } catch (Exception ex) {
            String message = ex.getMessage();
            return new ApiResponseDTO(false, message, null, "UNLIKE_POST_ERROR");
        }
    }

    @Transactional(readOnly = true)
    public ApiResponseDTO searchPosts(String keyword, Integer limit, Integer offset) {
        try {
            // Tìm kiếm theo title, content, child tag, parent tag (chỉ cần 1 trường khớp là trả về)
            String sql = "SELECT DISTINCT p.id, p.title, p.content, p.likes_count, p.comment_count, p.created_at, " +
                    "u.name AS user_name, u.avatar AS user_avatar, p.user_id " +
                    "FROM posts p " +
                    "JOIN users u ON p.user_id = u.id " +
                    "LEFT JOIN post_child_tags pct ON p.id = pct.post_id " +
                    "LEFT JOIN child_tags ct ON pct.child_tag_id = ct.id " +
                    "LEFT JOIN parent_tags pt ON ct.parent_tag_id = pt.id " +
                    "WHERE p.title LIKE CONCAT('%', :keyword, '%') " +
                    "OR p.content LIKE CONCAT('%', :keyword, '%') " +
                    "OR ct.name LIKE CONCAT('%', :keyword, '%') " +
                    "OR pt.name LIKE CONCAT('%', :keyword, '%') " +
                    "ORDER BY p.created_at DESC " +
                    "LIMIT :limit OFFSET :offset";
            List<Object[]> results = entityManager.createNativeQuery(sql)
                    .setParameter("keyword", keyword)
                    .setParameter("limit", limit)
                    .setParameter("offset", offset)
                    .getResultList();
            List<Map<String, Object>> formattedResults = convertPostsToKeyValue(results);
            return new ApiResponseDTO(true, "Tìm kiếm bài viết thành công", formattedResults, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi tìm kiếm bài viết: " + ex.getMessage(), null, "SEARCH_POST_ERROR");
        }
    }

    private List<Map<String, Object>> convertPostsToKeyValue(List<Object[]> results) {
        List<Map<String, Object>> formattedResults = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> post = new HashMap<>();
            Long postId = ((Number) row[0]).longValue();
            post.put("id", postId);
            post.put("title", row[1]);
            post.put("content", row[2]);
            post.put("likes_count", row[3]);
            post.put("comment_count", row[4]);
            post.put("created_at", row[5]);
            post.put("user_name", row[6]);
            post.put("user_avatar", row[7]);
            post.put("author_id", row[8]);
            
            // Lấy parent tags - chỉ lấy tên và nối thành chuỗi
            String parentTagSql = "SELECT pt.name FROM parent_tags pt " +
                    "JOIN post_parent_tags ppt ON pt.id = ppt.parent_tag_id " +
                    "WHERE ppt.post_id = :postId";
            List<String> parentTagNames = entityManager.createNativeQuery(parentTagSql)
                    .setParameter("postId", postId)
                    .getResultList();
            
            // Nối danh sách parent tag names thành một chuỗi ngăn cách bằng dấu phẩy
            String parentTagsStr = String.join(", ", parentTagNames);
            post.put("parent_tags", parentTagsStr);
            
            // Lấy child tags - chỉ lấy tên và nối thành chuỗi
            String childTagSql = "SELECT ct.name FROM child_tags ct " +
                    "JOIN post_child_tags pct ON ct.id = pct.child_tag_id " +
                    "WHERE pct.post_id = :postId";
            List<String> childTagNames = entityManager.createNativeQuery(childTagSql)
                    .setParameter("postId", postId)
                    .getResultList();
            
            // Nối danh sách child tag names thành một chuỗi ngăn cách bằng dấu phẩy
            String childTagsStr = String.join(", ", childTagNames);
            post.put("child_tags", childTagsStr);
            
            // Lấy image - chỉ lấy URL
            String imageSql = "SELECT image_url FROM posts_image WHERE post_id = :postId";
            List<String> imageResults = entityManager.createNativeQuery(imageSql)
                    .setParameter("postId", postId)
                    .getResultList();
            
            post.put("image", imageResults.isEmpty() ? null : imageResults.get(0));
            
            // Lấy file - chỉ lấy URL
            String fileSql = "SELECT file_url FROM posts_file WHERE post_id = :postId";
            List<String> fileResults = entityManager.createNativeQuery(fileSql)
                    .setParameter("postId", postId)
                    .getResultList();
            
            post.put("file", fileResults.isEmpty() ? null : fileResults.get(0));
            
            formattedResults.add(post);
        }
        return formattedResults;
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

    // Helper to extract root cause message from exception chain
    private String extractRootCauseMessage(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        String msg = cause.getMessage();
        // Try to extract MESSAGE_TEXT from SQLSTATE[45000] error
        if (msg != null && msg.contains("MESSAGE_TEXT = '")) {
            int idx = msg.indexOf("MESSAGE_TEXT = '");
            if (idx != -1) {
                int start = idx + "MESSAGE_TEXT = '".length();
                int end = msg.indexOf("'", start);
                if (end > start) {
                    return msg.substring(start, end);
                }
            }
        }
        return msg;
    }

    @Transactional(readOnly = true)
    public ApiResponseDTO getCommentCountForPost(Long postId) {
        try {
            String sql = "SELECT comment_count FROM posts WHERE id = :postId";
            Object result = entityManager.createNativeQuery(sql)
                    .setParameter("postId", postId)
                    .getSingleResult();
            Long count = (result instanceof Number) ? ((Number) result).longValue() : 0L;
            return new ApiResponseDTO(true, "Lấy số lượng bình luận thành công", count, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi lấy số lượng bình luận: " + ex.getMessage(), null, "GET_COMMENT_COUNT_ERROR");
        }
    }
}
        


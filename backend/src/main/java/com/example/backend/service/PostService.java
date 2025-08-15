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
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.example.backend.dto.response.PostImageDTO;
import com.example.backend.dto.response.PostFileDTO;

@Service
public class PostService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private PostRepository postRepository;

    // Tạo bài viết mới sử dụng stored procedure mới
    @Transactional
    public ApiResponseDTO createPost(PostCreateRequestDTO request) {
        try {
            // Map parentTag name to id
            Long parentTagId = null;
            if (request.getParentTag() != null && !request.getParentTag().isEmpty()) {
                List<?> ids = entityManager.createNativeQuery("SELECT id FROM parent_tags WHERE name = :name")
                        .setParameter("name", request.getParentTag())
                        .getResultList();
                if (!ids.isEmpty()) {
                    parentTagId = ((Number) ids.get(0)).longValue();
                }
            }
            // Map childTags name list to CSV id string
            String childTagIdsCsv = "";
            if (request.getChildTags() != null && !request.getChildTags().isEmpty()) {
                List<String> tags = request.getChildTags();
                Long parentTagIdForChild = null;
                // Lấy parentTagId để gán cho child tag mới nếu cần
                if (request.getParentTag() != null && !request.getParentTag().isEmpty()) {
                    List<?> parentIds = entityManager.createNativeQuery("SELECT id FROM parent_tags WHERE name = :name")
                        .setParameter("name", request.getParentTag())
                        .getResultList();
                    if (!parentIds.isEmpty()) {
                        parentTagIdForChild = ((Number) parentIds.get(0)).longValue();
                    }
                }
                // Tạo child tag nếu chưa có
                for (String tagName : tags) {
                    List<?> exist = entityManager.createNativeQuery("SELECT id FROM child_tags WHERE name = :name")
                        .setParameter("name", tagName)
                        .getResultList();
                    if (exist.isEmpty() && parentTagIdForChild != null) {
                        entityManager.createNativeQuery(
                            "INSERT INTO child_tags (name, parent_tag_id) VALUES (:name, :parentTagId)")
                            .setParameter("name", tagName)
                            .setParameter("parentTagId", parentTagIdForChild)
                            .executeUpdate();
                    }
                }
                // Lấy lại toàn bộ id các tag con (bao gồm vừa tạo)
                StringBuilder sql = new StringBuilder("SELECT id FROM child_tags WHERE name IN (");
                for (int i = 0; i < tags.size(); i++) {
                    if (i > 0) sql.append(",");
                    sql.append(":name").append(i);
                }
                sql.append(")");
                var q = entityManager.createNativeQuery(sql.toString());
                for (int i = 0; i < tags.size(); i++) {
                    q.setParameter("name" + i, tags.get(i));
                }
                List<?> ids = q.getResultList();
                StringBuilder sb = new StringBuilder();
                for (Object id : ids) {
                    if (sb.length() > 0) sb.append(",");
                    sb.append(id.toString());
                }
                childTagIdsCsv = sb.toString();
            }

            // Gọi stored procedure
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_create_post");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_author_id
            query.registerStoredProcedureParameter(2, String.class, jakarta.persistence.ParameterMode.IN); // p_title
            query.registerStoredProcedureParameter(3, String.class, jakarta.persistence.ParameterMode.IN); // p_content
            query.registerStoredProcedureParameter(4, Long.class, jakarta.persistence.ParameterMode.IN); // p_parent_tag_id
            query.registerStoredProcedureParameter(5, String.class, jakarta.persistence.ParameterMode.IN); // p_child_tag_ids

            query.setParameter(1, request.getAuthorId());
            query.setParameter(2, request.getTitle());
            query.setParameter(3, request.getContent());
            query.setParameter(4, parentTagId);
            query.setParameter(5, childTagIdsCsv);

            Object result = query.getSingleResult();
            Long postId;
            if (result instanceof Object[]) {
                postId = ((Number)((Object[])result)[0]).longValue();
            } else if (result instanceof Number) {
                postId = ((Number)result).longValue();
            } else {
                postId = null;
            }

            return new ApiResponseDTO(true, "Tạo bài viết thành công", postId, null);
        } catch (Exception ex) {
            String message = extractRootCauseMessage(ex);
            return new ApiResponseDTO(false, "Lỗi khi tạo bài viết: " + message, null, "CREATE_POST_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO updatePost(Long postId, PostCreateRequestDTO request) {
        try {
            // Kiểm tra postId có tồn tại không
            if (!postRepository.existsById(postId)) {
                return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
            }
            // Map parentTag name to id
            Long parentTagId = null;
            if (request.getParentTag() != null && !request.getParentTag().isEmpty()) {
                List<?> ids = entityManager.createNativeQuery("SELECT id FROM parent_tags WHERE name = :name")
                        .setParameter("name", request.getParentTag())
                        .getResultList();
                if (!ids.isEmpty()) {
                    parentTagId = ((Number) ids.get(0)).longValue();
                }
            }
            // Map childTags name list to CSV id string
            String childTagIdsCsv = "";
            if (request.getChildTags() != null && !request.getChildTags().isEmpty()) {
                List<String> tags = request.getChildTags();
                // Xây dựng query động cho IN (...)
                StringBuilder sql = new StringBuilder("SELECT id FROM child_tags WHERE name IN (");
                for (int i = 0; i < tags.size(); i++) {
                    if (i > 0) sql.append(",");
                    sql.append(":name").append(i);
                }
                sql.append(")");
                var q = entityManager.createNativeQuery(sql.toString());
                for (int i = 0; i < tags.size(); i++) {
                    q.setParameter("name" + i, tags.get(i));
                }
                List<?> ids = q.getResultList();
                StringBuilder sb = new StringBuilder();
                for (Object id : ids) {
                    if (sb.length() > 0) sb.append(",");
                    sb.append(id.toString());
                }
                childTagIdsCsv = sb.toString();
            }

            // Sử dụng stored procedure mới
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_update_post");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_post_id
            query.registerStoredProcedureParameter(2, String.class, jakarta.persistence.ParameterMode.IN); // p_title
            query.registerStoredProcedureParameter(3, String.class, jakarta.persistence.ParameterMode.IN); // p_content
            query.registerStoredProcedureParameter(4, Long.class, jakarta.persistence.ParameterMode.IN); // p_parent_tag_id
            query.registerStoredProcedureParameter(5, String.class, jakarta.persistence.ParameterMode.IN); // p_child_tag_ids

            query.setParameter(1, postId);
            query.setParameter(2, request.getTitle());
            query.setParameter(3, request.getContent());
            query.setParameter(4, parentTagId);
            query.setParameter(5, childTagIdsCsv);

            query.execute();

            return new ApiResponseDTO(true, "Cập nhật bài viết thành công", postId, null);
        } catch (Exception ex) {
            String message = extractRootCauseMessage(ex);
            return new ApiResponseDTO(false, "Lỗi khi cập nhật bài viết: " + message, null, "UPDATE_POST_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO deletePost(Long postId) {
        try {
            // Kiểm tra postId có tồn tại không
            if (!postRepository.existsById(postId)) {
                return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
            }
            // Sử dụng stored procedure mới
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_delete_post");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_post_id
            query.setParameter(1, postId);
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
                sql = "SELECT p.id, p.title, p.content, p.likes_count, p.comment_count, p.created_at, " +
                        "u.name AS user_name, p.author_id " +
                        "FROM posts p " +
                        "JOIN users u ON p.author_id = u.id " +
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
                        "u.name AS user_name, p.author_id " +
                        "FROM posts p " +
                        "JOIN users u ON p.author_id = u.id " +
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
                        "u.name AS user_name, p.author_id " +
                        "FROM posts p " +
                        "JOIN users u ON p.author_id = u.id " +
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
                            "u.name AS user_name, p.author_id " +
                            "FROM posts p " +
                            "JOIN users u ON p.author_id = u.id " +
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
                            "u.name AS user_name, p.author_id " +
                            "FROM posts p " +
                            "JOIN users u ON p.author_id = u.id " +
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
            // Gọi stored procedure, truyền userId vào p_liker_id (đúng)
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_like_post");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_post_id
            query.registerStoredProcedureParameter(2, Long.class, jakarta.persistence.ParameterMode.IN); // p_liker_id
            query.setParameter(1, postId);
            query.setParameter(2, userId); // userId ở đây là liker_id
            query.execute();
            return new ApiResponseDTO(true, "Like bài viết thành công", null, null);
        } catch (Exception ex) {
            String message = extractRootCauseMessage(ex);
            return new ApiResponseDTO(false, "Lỗi khi like bài viết: " + message, null, "LIKE_POST_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO unlikePost(Long postId, Long userId) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_unlike_post");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_post_id
            query.registerStoredProcedureParameter(2, Long.class, jakarta.persistence.ParameterMode.IN); // p_liker_id
            query.setParameter(1, postId);
            query.setParameter(2, userId);
            query.execute();
            return new ApiResponseDTO(true, "Unlike bài viết thành công", null, null);
        } catch (Exception ex) {
            String message = extractRootCauseMessage(ex);
            return new ApiResponseDTO(false, "Lỗi khi unlike bài viết: " + message, null, "UNLIKE_POST_ERROR");
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
            post.put("author_id", row[7]);

            // Lấy parent tags - trả về mảng tên
            String parentTagSql = "SELECT pt.name FROM parent_tags pt " +
                    "JOIN post_parent_tags ppt ON pt.id = ppt.parent_tag_id " +
                    "WHERE ppt.post_id = :postId";
            List<String> parentTagNames = entityManager.createNativeQuery(parentTagSql)
                    .setParameter("postId", postId)
                    .getResultList();
            post.put("parent_tags", parentTagNames);

            // Lấy child tags - trả về mảng tên
            String childTagSql = "SELECT ct.name FROM child_tags ct " +
                    "JOIN post_child_tags pct ON ct.id = pct.child_tag_id " +
                    "WHERE pct.post_id = :postId";
            List<String> childTagNames = entityManager.createNativeQuery(childTagSql)
                    .setParameter("postId", postId)
                    .getResultList();
            post.put("child_tags", childTagNames);

            // Lấy image - trả về object { id, name, type, size, caption }
            String imageSql = "SELECT id, image_name, image_type, image_size, caption FROM posts_image WHERE post_id = :postId ORDER BY id ASC LIMIT 1";
            List<Object[]> imageResults = entityManager.createNativeQuery(imageSql)
                    .setParameter("postId", postId)
                    .getResultList();
            if (!imageResults.isEmpty()) {
                Object[] img = imageResults.get(0);
                Map<String, Object> imageObj = new HashMap<>();
                imageObj.put("id", img[0]);
                imageObj.put("name", img[1]);
                imageObj.put("type", img[2]);
                imageObj.put("size", img[3]);
                imageObj.put("caption", img[4]);
                post.put("image", imageObj);
            } else {
                post.put("image", null);
            }

            // Lấy file - trả về object { id, name, type, size }
            String fileSql = "SELECT id, file_name, file_type, file_size FROM posts_file WHERE post_id = :postId ORDER BY id ASC LIMIT 1";
            List<Object[]> fileResults = entityManager.createNativeQuery(fileSql)
                    .setParameter("postId", postId)
                    .getResultList();
            if (!fileResults.isEmpty()) {
                Object[] file = fileResults.get(0);
                Map<String, Object> fileObj = new HashMap<>();
                fileObj.put("id", file[0]);
                fileObj.put("name", file[1]);
                fileObj.put("type", file[2]);
                fileObj.put("size", file[3]);
                post.put("file", fileObj);
            } else {
                post.put("file", null);
            }

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

    // Thêm phương thức upload ảnh cho post
    @Transactional
    public ApiResponseDTO savePostImage(Long postId, MultipartFile file, String caption) {
        try {
            if (!postRepository.existsById(postId)) {
                return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
            }
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_save_post_image");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(2, byte[].class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(3, String.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(4, String.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(5, Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(6, String.class, jakarta.persistence.ParameterMode.IN);

            query.setParameter(1, postId);
            query.setParameter(2, file.getBytes());
            query.setParameter(3, file.getOriginalFilename());
            query.setParameter(4, file.getContentType());
            query.setParameter(5, file.getSize());
            query.setParameter(6, caption);

            query.execute();
            return new ApiResponseDTO(true, "Upload ảnh thành công", null, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi upload ảnh: " + ex.getMessage(), null, "UPLOAD_IMAGE_ERROR");
        }
    }

    // Thêm phương thức lấy ảnh theo id
    @Transactional(readOnly = true)
    public Optional<PostImageDTO> getPostImageById(Long imageId) {
        try {
            String sql = "SELECT image_data, image_type, image_name, image_size FROM posts_image WHERE id = ?";
            Object[] row = (Object[]) entityManager.createNativeQuery(sql)
                .setParameter(1, imageId)
                .getSingleResult();
            if (row == null) return Optional.empty();
            PostImageDTO dto = new PostImageDTO(
                (byte[]) row[0],
                (String) row[1],
                (String) row[2],
                ((Number) row[3]).longValue()
            );
            return Optional.of(dto);
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    // Thêm phương thức upload file cho post
    @Transactional
    public ApiResponseDTO savePostFile(Long postId, MultipartFile file) {
        try {
            if (!postRepository.existsById(postId)) {
                return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
            }
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_save_post_file");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(2, byte[].class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(3, String.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(4, String.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(5, Long.class, jakarta.persistence.ParameterMode.IN);

            query.setParameter(1, postId);
            query.setParameter(2, file.getBytes());
            query.setParameter(3, file.getOriginalFilename());
            query.setParameter(4, file.getContentType());
            query.setParameter(5, file.getSize());

            query.execute();
            return new ApiResponseDTO(true, "Upload file thành công", null, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi upload file: " + ex.getMessage(), null, "UPLOAD_FILE_ERROR");
        }
    }

    // Thêm phương thức lấy file theo id
    @Transactional(readOnly = true)
    public Optional<PostFileDTO> getPostFileById(Long fileId) {
        try {
            String sql = "SELECT file_data, file_type, file_name, file_size FROM posts_file WHERE id = ?";
            Object[] row = (Object[]) entityManager.createNativeQuery(sql)
                .setParameter(1, fileId)
                .getSingleResult();
            if (row == null) return Optional.empty();
            PostFileDTO dto = new PostFileDTO(
                (byte[]) row[0],
                (String) row[1],
                (String) row[2],
                ((Number) row[3]).longValue()
            );
            return Optional.of(dto);
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    // Save post cho user (dùng stored procedure)
    @Transactional
    public ApiResponseDTO savePost(Long postId, Long userId) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_save_post");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_user_id
            query.registerStoredProcedureParameter(2, Long.class, jakarta.persistence.ParameterMode.IN); // p_post_id
            query.setParameter(1, userId);
            query.setParameter(2, postId);
            query.execute();
            return new ApiResponseDTO(true, "Lưu bài viết thành công", null, null);
        } catch (Exception ex) {
            String msg = extractRootCauseMessage(ex);
            return new ApiResponseDTO(false, "Lỗi khi lưu bài viết: " + msg, null, "SAVE_POST_ERROR");
        }
    }

    // Unsave post cho user (dùng stored procedure)
    @Transactional
    public ApiResponseDTO unsavePost(Long postId, Long userId) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_unsave_post");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_user_id
            query.registerStoredProcedureParameter(2, Long.class, jakarta.persistence.ParameterMode.IN); // p_post_id
            query.setParameter(1, userId);
            query.setParameter(2, postId);
            query.execute();
            return new ApiResponseDTO(true, "Bỏ lưu bài viết thành công", null, null);
        } catch (Exception ex) {
            String msg = extractRootCauseMessage(ex);
            return new ApiResponseDTO(false, "Lỗi khi bỏ lưu bài viết: " + msg, null, "UNSAVE_POST_ERROR");
        }
    }

}
            
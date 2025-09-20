package com.example.backend.service;

import com.example.backend.dto.request.PostCreateRequestDTO;
import com.example.backend.entity.User;
import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.PostImageRepository;
import com.example.backend.repository.PostFileRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.example.backend.dto.response.PostImageDTO;
import com.example.backend.dto.response.PostFileDTO;
import com.example.backend.entity.PostImage;
import com.example.backend.entity.Post;

@Service
public class PostService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostImageRepository postImageRepository;

    @Autowired
    private PostFileRepository postFileRepository;

    // Tạo bài viết mới sử dụng stored procedure mới
    @Transactional
    public ApiResponseDTO createPost(PostCreateRequestDTO request) {
        try {
            // Convert childTags list to a comma-separated string
            String childTagNamesCsv = String.join(", ", request.getChildTags());

            // Call stored procedure
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_create_post");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_author_id
            query.registerStoredProcedureParameter(2, String.class, jakarta.persistence.ParameterMode.IN); // p_title
            query.registerStoredProcedureParameter(3, String.class, jakarta.persistence.ParameterMode.IN); // p_content
            query.registerStoredProcedureParameter(4, String.class, jakarta.persistence.ParameterMode.IN); // p_parent_tag_name
            query.registerStoredProcedureParameter(5, String.class, jakarta.persistence.ParameterMode.IN); // p_child_tag_names

            query.setParameter(1, request.getAuthorId());
            query.setParameter(2, request.getTitle());
            query.setParameter(3, request.getContent());
            query.setParameter(4, request.getParentTag());
            query.setParameter(5, childTagNamesCsv);

            Object result = query.getSingleResult();
            Long postId = (result instanceof Number) ? ((Number) result).longValue() : null;

            return new ApiResponseDTO(true, "Tạo bài viết thành công", postId, null);
        } catch (Exception ex) {
            String message = extractRootCauseMessage(ex);
            return new ApiResponseDTO(false, "Lỗi khi tạo bài viết: " + message, null, "CREATE_POST_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO updatePost(Long postId, PostCreateRequestDTO request) {
        try {
            // Convert childTags list to a comma-separated string
            String childTagNamesCsv = String.join(", ", request.getChildTags());

            // Call stored procedure
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_update_post");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_post_id
            query.registerStoredProcedureParameter(2, String.class, jakarta.persistence.ParameterMode.IN); // p_title
            query.registerStoredProcedureParameter(3, String.class, jakarta.persistence.ParameterMode.IN); // p_content
            query.registerStoredProcedureParameter(4, String.class, jakarta.persistence.ParameterMode.IN); // p_parent_tag_name
            query.registerStoredProcedureParameter(5, String.class, jakarta.persistence.ParameterMode.IN); // p_child_tag_names

            query.setParameter(1, postId);
            query.setParameter(2, request.getTitle());
            query.setParameter(3, request.getContent());
            query.setParameter(4, request.getParentTag());
            query.setParameter(5, childTagNamesCsv);

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
            String message = extractRootCauseMessage(ex);
            return new ApiResponseDTO(false, "Lỗi khi xóa bài viết: " + message, null, "DELETE_POST_ERROR");
        }
    }

    @Transactional()
    public ApiResponseDTO getPostsByCategory(String categoryPath, int limit, int offset, Long userId) {
        try {
            List<Object[]> results;
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_get_posts_by_category");
            query.registerStoredProcedureParameter(1, String.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(2, Integer.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(3, Integer.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(4, Long.class, jakarta.persistence.ParameterMode.IN);

            // Truyền nguyên categoryPath FE (ví dụ: /general, /general/intro, ...)
            query.setParameter(1, categoryPath);
            query.setParameter(2, limit);
            query.setParameter(3, offset);
            query.setParameter(4, userId);

            results = query.getResultList();

            List<Map<String, Object>> formattedResults = convertPostsToKeyValue(results, userId);
            return new ApiResponseDTO(true, "Lấy bài viết theo category thành công", formattedResults, null);
        } catch (Exception ex) {
            String message = extractRootCauseMessage(ex);
            ex.printStackTrace();
            return new ApiResponseDTO(false, "Lỗi khi lấy bài viết theo category: " + message, null, "GET_POSTS_BY_CATEGORY_ERROR");
        }
    }

    // Lấy bài viết theo user (bao gồm ảnh/file)
    @Transactional
    public ApiResponseDTO getPostsByUser(Long userId, int limit, int offset, Long viewerId) {
        try {
            List<Object[]> results;
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_get_user_posts");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(2, Integer.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(3, Integer.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(4, Long.class, jakarta.persistence.ParameterMode.IN);

            query.setParameter(1, userId);
            query.setParameter(2, limit);
            query.setParameter(3, offset);
            query.setParameter(4, viewerId);

            results = query.getResultList();

            List<Map<String, Object>> formattedResults = convertPostsToKeyValue(results, viewerId);
            return new ApiResponseDTO(true, "Lấy bài viết theo user thành công", formattedResults, null);
        } catch (Exception ex) {
            String message = extractRootCauseMessage(ex);
            ex.printStackTrace();
            return new ApiResponseDTO(false, "Lỗi khi lấy bài viết theo user: " + message, null, "GET_POSTS_BY_USER_ERROR");
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

    @Transactional
    public ApiResponseDTO searchPosts(String keyword, Integer limit, Integer offset, Long userId) {
        try {
            // Tracking hành vi tìm kiếm (upsert)
            if (userId != null && keyword != null && !keyword.trim().isEmpty()) {
                trackUserSearch(userId, keyword);
            }
            // Gọi stored procedure mới
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_search_posts");
            query.registerStoredProcedureParameter(1, String.class, jakarta.persistence.ParameterMode.IN); // p_keyword
            query.registerStoredProcedureParameter(2, Integer.class, jakarta.persistence.ParameterMode.IN); // p_limit
            query.registerStoredProcedureParameter(3, Integer.class, jakarta.persistence.ParameterMode.IN); // p_offset
            query.registerStoredProcedureParameter(4, Long.class, jakarta.persistence.ParameterMode.IN); // p_user_id

            query.setParameter(1, keyword);
            query.setParameter(2, limit);
            query.setParameter(3, offset);
            query.setParameter(4, userId);

            List<Object[]> results = query.getResultList();
            List<Map<String, Object>> formattedResults = convertPostsToKeyValue(results, userId);
            return new ApiResponseDTO(true, "Tìm kiếm bài viết thành công", formattedResults, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi tìm kiếm bài viết: " + ex.getMessage(), null, "SEARCH_POST_ERROR");
        }
    }

    // Đề xuất bài viết dựa trên hành vi người dùng (luôn trả về tối đa 5 bài mới nhất)
    @Transactional 
    public ApiResponseDTO getRecommendedPosts(Long userId, int limit, int offset) {
        try {
            // SP sẽ override limit thành 5, nên truyền gì cũng được
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_get_recommended_posts");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(2, Integer.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(3, Integer.class, jakarta.persistence.ParameterMode.IN);

            query.setParameter(1, userId);
            query.setParameter(2, 5); // truyền 5 cho rõ ràng, SP sẽ override
            query.setParameter(3, offset);

            List<Object[]> results = query.getResultList();
            List<Map<String, Object>> formattedResults = convertPostsToKeyValue(results, userId);
            return new ApiResponseDTO(true, "Đề xuất bài viết thành công", formattedResults, null);
        } catch (Exception ex) {
            String message = extractRootCauseMessage(ex);
            return new ApiResponseDTO(false, "Lỗi khi đề xuất bài viết: " + message, null, "RECOMMEND_POST_ERROR");
        }
    }

    // Ghi nhận hành vi tìm kiếm của user (upsert vào bảng tracking)
    @Transactional
    public void trackUserSearch(Long userId, String keyword) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_track_user_search");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(2, String.class, jakarta.persistence.ParameterMode.IN);
            query.setParameter(1, userId);
            query.setParameter(2, keyword);
            query.execute();
        } catch (Exception ex) {
            // Không throw lỗi, chỉ log nếu cần
            System.err.println("Track user search failed: " + ex.getMessage());
        }
    }

    // Lấy thông tin chi tiết bài viết (bao gồm ảnh/file) - dùng cho trang chi tiết bài viết
    @Transactional(readOnly = true)
    public ApiResponseDTO getPostDetail(Long postId, Long userId) {
        try {
            // Kiểm tra postId có tồn tại không
            if (!postRepository.existsById(postId)) {
                return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
            }

            // Lấy thông tin bài viết
            String postSql = "SELECT id, title, content, author_id, created_at, updated_at, " +
                    " (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count, " +
                    " (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count, " +
                    " (SELECT GROUP_CONCAT(tag_id) FROM post_tags WHERE post_id = p.id) as tag_ids_csv " +
                    "FROM posts p WHERE id = :postId";
            Object postObj = entityManager.createNativeQuery(postSql)
                    .setParameter("postId", postId)
                    .getSingleResult();

            if (postObj == null) {
                return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
            }

            Object[] postRow = (Object[]) postObj;
            Map<String, Object> post = new HashMap<>();
            post.put("id", postRow[0]);
            post.put("title", postRow[1]);
            post.put("content", postRow[2]);
            post.put("author_id", postRow[3]);
            post.put("created_at", postRow[4]);
            post.put("updated_at", postRow[5]);
            post.put("likes_count", postRow[6]);
            post.put("comment_count", postRow[7]);

            // Lấy thông tin tác giả
            Long authorId = (Long) postRow[3];
            String authorSql = "SELECT id, name, avatar FROM users WHERE id = :authorId";
            Object authorObj = entityManager.createNativeQuery(authorSql)
                    .setParameter("authorId", authorId)
                    .getSingleResult();
            if (authorObj != null) {
                Object[] authorRow = (Object[]) authorObj;
                Map<String, Object> author = new HashMap<>();
                author.put("id", authorRow[0]);
                author.put("name", authorRow[1]);
                author.put("avatar", authorRow[2]);
                post.put("author", author);
            }

            // Lấy danh sách ảnh
            String imagesSql = "SELECT id, image_name, image_type FROM posts_image WHERE post_id = :postId ORDER BY id ASC";
            List<Object[]> imageResults = entityManager.createNativeQuery(imagesSql)
                    .setParameter("postId", postId)
                    .getResultList();
            List<Map<String, Object>> images = new ArrayList<>();
            for (Object[] img : imageResults) {
                Map<String, Object> imageObj = new HashMap<>();
                imageObj.put("id", img[0]);
                imageObj.put("name", img[1]);
                imageObj.put("type", img[2]);
                images.add(imageObj);
            }
            post.put("images", images);

            // Lấy danh sách file
            String filesSql = "SELECT id, file_name, file_type FROM posts_file WHERE post_id = :postId ORDER BY id ASC";
            List<Object[]> fileResults = entityManager.createNativeQuery(filesSql)
                    .setParameter("postId", postId)
                    .getResultList();
            List<Map<String, Object>> files = new ArrayList<>();
            for (Object[] file : fileResults) {
                Map<String, Object> fileObj = new HashMap<>();
                fileObj.put("id", file[0]);
                fileObj.put("name", file[1]);
                fileObj.put("type", file[2]);
                files.add(fileObj);
            }
            post.put("files", files);

            // Kiểm tra đã like bài viết chưa
            boolean isLiked = entityManager.createNativeQuery("SELECT COUNT(*) FROM post_likes WHERE post_id = :postId AND liker_id = :userId")
                    .setParameter("postId", postId)
                    .setParameter("userId", userId)
                    .getSingleResult() != null;
            post.put("is_liked", isLiked);

            // Kiểm tra đã lưu bài viết chưa
            boolean isSaved = entityManager.createNativeQuery("SELECT COUNT(*) FROM saved_posts WHERE post_id = :postId AND user_id = :userId")
                    .setParameter("postId", postId)
                    .setParameter("userId", userId)
                    .getSingleResult() != null;
            post.put("is_saved", isSaved);

            return new ApiResponseDTO(true, "Lấy chi tiết bài viết thành công", post, null);
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi lấy chi tiết bài viết: " + ex.getMessage(), null, "GET_POST_DETAIL_ERROR");
        }
    }

    // Thay đổi hàm convertPostsToKeyValue để nhận userId và trả về is_liked
    private List<Map<String, Object>> convertPostsToKeyValue(List<Object[]> results, Long userId) {
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
            post.put("is_liked", toBool(row[9]));
            post.put("is_saved", toBool(row[10]));

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

            // Lấy tất cả ảnh - trả về mảng object { id, name, type }
            String imagesSql = "SELECT id, image_name, image_type FROM posts_image WHERE post_id = :postId ORDER BY id ASC";
            List<Object[]> imageResults = entityManager.createNativeQuery(imagesSql)
                    .setParameter("postId", postId)
                    .getResultList();
            List<Map<String, Object>> images = new ArrayList<>();
            for (Object[] img : imageResults) {
                Map<String, Object> imageObj = new HashMap<>();
                imageObj.put("id", img[0]);
                imageObj.put("name", img[1]);
                imageObj.put("type", img[2]);
                images.add(imageObj);
            }
            post.put("images", images);

            // Lấy tất cả file - trả về mảng object { id, name, type }
            String filesSql = "SELECT id, file_name, file_type FROM posts_file WHERE post_id = :postId ORDER BY id ASC";
            List<Object[]> fileResults = entityManager.createNativeQuery(filesSql)
                    .setParameter("postId", postId)
                    .getResultList();
            List<Map<String, Object>> files = new ArrayList<>();
            for (Object[] file : fileResults) {
                Map<String, Object> fileObj = new HashMap<>();
                fileObj.put("id", file[0]);
                fileObj.put("name", file[1]);
                fileObj.put("type", file[2]);
                files.add(fileObj);
            }
            post.put("files", files);

            formattedResults.add(post);
        }
        return formattedResults;
    }

    // Helper chuyển giá trị sang boolean
    private boolean toBool(Object v) {
        if (v == null) return false;
        if (v instanceof Boolean) return (Boolean) v;
        if (v instanceof Number) return ((Number) v).intValue() != 0;
        if (v instanceof String) return v.equals("1") || ((String) v).equalsIgnoreCase("true");
        return false;
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
public ApiResponseDTO savePostImage(Long postId, MultipartFile file) {
    if (postId == null || postId <= 0) {
        return new ApiResponseDTO(false, "ID bài viết không hợp lệ", null, "INVALID_POST_ID");
    }
    boolean postExists = postRepository.existsById(postId);
    if (!postExists) {
        return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
    }
    if (file == null || file.isEmpty()) {
        return new ApiResponseDTO(false, "File ảnh không được để trống", null, "INVALID_FILE");
    }
    if (file.getSize() > 5 * 1024 * 1024) {
        return new ApiResponseDTO(false, "Kích thước ảnh vượt quá 5MB", null, "IMAGE_TOO_LARGE");
    }
    if (!Arrays.asList("image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp").contains(file.getContentType())) {
        return new ApiResponseDTO(false, "Loại ảnh không hợp lệ, chỉ hỗ trợ JPEG, PNG, GIF, BMP, hoặc WebP", null, "INVALID_FILE_TYPE");
    }

    try {
        byte[] fileBytes = file.getBytes();
        if (fileBytes.length == 0) {
            return new ApiResponseDTO(false, "Dữ liệu ảnh rỗng", null, "EMPTY_FILE");
        }

        // Nén ảnh bằng CompressService
        byte[] compressedImage = CompressService.compress(fileBytes);

        // Gọi stored procedure để lưu ảnh
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_save_post_image");
        query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN); // p_post_id
        query.registerStoredProcedureParameter(2, byte[].class, jakarta.persistence.ParameterMode.IN); // p_image_data
        query.registerStoredProcedureParameter(3, String.class, jakarta.persistence.ParameterMode.IN); // p_image_name
        query.registerStoredProcedureParameter(4, String.class, jakarta.persistence.ParameterMode.IN); // p_image_type

        query.setParameter(1, postId);
        query.setParameter(2, compressedImage);
        query.setParameter(3, file.getOriginalFilename());
        query.setParameter(4, file.getContentType());

        query.execute();

        // Chỉ trả về post_id là đủ
        Map<String, Object> imageInfo = new HashMap<>();
        imageInfo.put("post_id", postId);

        return new ApiResponseDTO(true, "Upload ảnh thành công", imageInfo, null);
    } catch (IOException ioEx) {
        return new ApiResponseDTO(false, "Lỗi khi đọc dữ liệu ảnh: " + ioEx.getMessage(), null, "UPLOAD_IMAGE_IO_ERROR");
    } catch (Exception ex) {
        return new ApiResponseDTO(false, "Lỗi khi upload ảnh: " + ex.getMessage(), null, "UPLOAD_IMAGE_ERROR");
    }
}

// Khi trả ảnh về client, giải nén bằng CompressService
@Transactional
public ApiResponseDTO getPostImageById(Long imageId) {
    if (imageId == null || imageId <= 0) {
        return new ApiResponseDTO(false, "ID ảnh không hợp lệ", null, "INVALID_IMAGE_ID");
    }
    if (!postImageRepository.existsById(imageId)) {
        return new ApiResponseDTO(false, "Ảnh không tồn tại", null, "IMAGE_NOT_FOUND");
    }
    try {
        String sql = "SELECT image_data, image_type, image_name FROM posts_image WHERE id = ?";
        Object[] row = (Object[]) entityManager.createNativeQuery(sql)
            .setParameter(1, imageId)
            .getSingleResult();
        if (row == null) {
            return new ApiResponseDTO(false, "Ảnh không tồn tại", null, "IMAGE_NOT_FOUND");
        }
        byte[] decompressed = CompressService.decompress((byte[]) row[0]);
        PostImageDTO dto = new PostImageDTO(
            decompressed,
            (String) row[1],
            (String) row[2]
        );
        return new ApiResponseDTO(true, "Lấy ảnh thành công", dto, null);
    } catch (Exception ex) {
        return new ApiResponseDTO(false, "Lỗi khi lấy ảnh: " + ex.getMessage(), null, "GET_IMAGE_ERROR");
    }
}

    // Thêm phương thức upload file cho post
    @Transactional
    public ApiResponseDTO savePostFile(Long postId, MultipartFile file) {
        // Kiểm tra null, empty, loại file, ... trước khi đọc file.getBytes()
        if (!postRepository.existsById(postId)) {
            return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
        }
        if (file == null) {
            return new ApiResponseDTO(false, "File không được để trống", null, "INVALID_FILE");
        }
        if (file.isEmpty()) {
            return new ApiResponseDTO(false, "File không được để trống", null, "INVALID_FILE");
        }
        // Kiểm tra loại file trước khi đọc file.getSize()
        List<String> allowedTypes = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "application/zip",
            "application/x-rar-compressed",
            "image/png",
            "image/jpeg",
            "image/jpg"
        );
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            return new ApiResponseDTO(false, "Loại file không hợp lệ. Chỉ hỗ trợ pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip, rar, png, jpg.", null, "INVALID_FILE_TYPE");
        }
        // Kiểm tra kích thước file (nên kiểm tra sau khi chắc chắn file != null)
        if (file.getSize() > 5 * 1024 * 1024) {
            return new ApiResponseDTO(false, "Kích thước file vượt quá 5MB", null, "FILE_TOO_LARGE");
        }
        try {
            byte[] fileBytes = file.getBytes();
            // byte[] compressedFile = CompressService.compress(fileBytes); // Nếu muốn nén file

            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_save_post_file");
            query.registerStoredProcedureParameter(1, Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(2, byte[].class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(3, String.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter(4, String.class, jakarta.persistence.ParameterMode.IN);

            query.setParameter(1, postId);
            query.setParameter(2, fileBytes); // hoặc compressedFile nếu muốn nén
            query.setParameter(3, file.getOriginalFilename());
            query.setParameter(4, contentType);

            query.execute();

            // Chỉ trả về post_id là đủ
            Map<String, Object> fileInfo = new HashMap<>();
            fileInfo.put("post_id", postId);

            return new ApiResponseDTO(true, "Upload file thành công", fileInfo, null);
        } catch (IOException ioEx) {
            return new ApiResponseDTO(false, "Lỗi khi đọc dữ liệu file: " + ioEx.getMessage(), null, "UPLOAD_FILE_IO_ERROR");
        } catch (Exception ex) {
            return new ApiResponseDTO(false, "Lỗi khi upload file: " + ex.getMessage(), null, "UPLOAD_FILE_ERROR");
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

    // Khi trả file về client, giải nén bằng CompressService
@Transactional
public ApiResponseDTO getPostFileById(Long fileId) {
    if (fileId == null || fileId <= 0) {
        return new ApiResponseDTO(false, "ID file không hợp lệ", null, "INVALID_FILE_ID");
    }
    // Nếu có PostFileRepository thì kiểm tra tồn tại ở đây, ví dụ:
    if (!postFileRepository.existsById(fileId)) {
        return new ApiResponseDTO(false, "File không tồn tại", null, "FILE_NOT_FOUND");
    }
    try {
        String sql = "SELECT file_data, file_type, file_name FROM posts_file WHERE id = ?";
        Object[] row = (Object[]) entityManager.createNativeQuery(sql)
            .setParameter(1, fileId)
            .getSingleResult();
        if (row == null) {
            return new ApiResponseDTO(false, "File không tồn tại", null, "FILE_NOT_FOUND");
        }
        byte[] decompressed = CompressService.decompress((byte[]) row[0]);
        PostFileDTO dto = new PostFileDTO(
            decompressed,
            (String) row[1],
            (String) row[2]
        );
        return new ApiResponseDTO(true, "Lấy file thành công", dto, null);
    } catch (Exception ex) {
        return new ApiResponseDTO(false, "Lỗi khi lấy file: " + ex.getMessage(), null, "GET_FILE_ERROR");
    }
}

// Đếm tổng số bài viết cho home hoặc popular
@Transactional(readOnly = true)
public ApiResponseDTO countPostsHomePopular() {
    try {
        Object result = entityManager.createNativeQuery("CALL sp_count_posts_home_popular()").getSingleResult();
        Long total = (result instanceof Number) ? ((Number) result).longValue() : 0L;
        return new ApiResponseDTO(true, "Tổng số bài viết home/popular", total, null);
    } catch (Exception ex) {
        return new ApiResponseDTO(false, "Lỗi khi đếm bài viết home/popular: " + ex.getMessage(), null, "COUNT_HOME_POPULAR_ERROR");
    }
}

// Đếm tổng số bài viết đã lưu của user
@Transactional(readOnly = true)
public ApiResponseDTO countPostsSaved(Long userId) {
    try {
        Object result = entityManager.createNativeQuery("CALL sp_count_posts_saved(?)")
            .setParameter(1, userId)
            .getSingleResult();
        Long total = (result instanceof Number) ? ((Number) result).longValue() : 0L;
        return new ApiResponseDTO(true, "Tổng số bài viết đã lưu", total, null);
    } catch (Exception ex) {
        return new ApiResponseDTO(false, "Lỗi khi đếm bài viết đã lưu: " + ex.getMessage(), null, "COUNT_SAVED_ERROR");
    }
}

// Đếm tổng số bài viết theo tag cha
@Transactional(readOnly = true)
public ApiResponseDTO countPostsByParentTag(String parentTag) {
    try {
        Object result = entityManager.createNativeQuery("CALL sp_count_posts_by_parent_tag(?)")
            .setParameter(1, parentTag)
            .getSingleResult();
        Long total = (result instanceof Number) ? ((Number) result).longValue() : 0L;
        return new ApiResponseDTO(true, "Tổng số bài viết theo tag cha", total, null);
    } catch (Exception ex) {
        return new ApiResponseDTO(false, "Lỗi khi đếm bài viết theo tag cha: " + ex.getMessage(), null, "COUNT_PARENT_TAG_ERROR");
    }
}

// Đếm tổng số bài viết theo tag con
@Transactional(readOnly = true)
public ApiResponseDTO countPostsByChildTag(String childTag) {
    try {
        Object result = entityManager.createNativeQuery("CALL sp_count_posts_by_child_tag(?)")
            .setParameter(1, childTag)
            .getSingleResult();
        Long total = (result instanceof Number) ? ((Number) result).longValue() : 0L;
        return new ApiResponseDTO(true, "Tổng số bài viết theo tag con", total, null);
    } catch (Exception ex) {
        return new ApiResponseDTO(false, "Lỗi khi đếm bài viết theo tag con: " + ex.getMessage(), null, "COUNT_CHILD_TAG_ERROR");
    }
}

// Đếm tổng số bài viết theo từ khóa tìm kiếm
@Transactional(readOnly = true)
public ApiResponseDTO countPostsBySearch(String keyword) {
    try {
        Object result = entityManager.createNativeQuery("CALL sp_count_posts_by_search(?)")
            .setParameter(1, keyword)
            .getSingleResult();
        Long total = (result instanceof Number) ? ((Number) result).longValue() : 0L;
        return new ApiResponseDTO(true, "Tổng số bài viết theo tìm kiếm", total, null);
    } catch (Exception ex) {
        return new ApiResponseDTO(false, "Lỗi khi đếm bài viết theo tìm kiếm: " + ex.getMessage(), null, "COUNT_SEARCH_ERROR");
    }
}
}
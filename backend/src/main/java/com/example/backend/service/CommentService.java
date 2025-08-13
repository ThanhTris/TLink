package com.example.backend.service;

import com.example.backend.dto.common.ApiResponseDTO;
import com.example.backend.dto.request.CommentCreateRequestDTO;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;

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
public class CommentService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ApiResponseDTO addComment(CommentCreateRequestDTO request) {
        try {
            if (postRepository.findById(request.getPostId()).isEmpty()) {
                return new ApiResponseDTO(false, "Bài viết không tồn tại", null, "POST_NOT_FOUND");
            }
            if (userRepository.findById(request.getUserId()).isEmpty()) {
                return new ApiResponseDTO(false, "Người dùng không tồn tại", null, "USER_NOT_FOUND");
            }
          

            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_add_comment");
            query.registerStoredProcedureParameter("p_post_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_user_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_parent_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_content", String.class, jakarta.persistence.ParameterMode.IN);

            query.setParameter("p_post_id", request.getPostId());
            query.setParameter("p_user_id", request.getUserId());
            query.setParameter("p_parent_id", request.getParentId());
            query.setParameter("p_content", request.getContent());

            query.execute();
            Object resultObj = query.getSingleResult();
            Long commentId = null;
            if (resultObj instanceof Number) {
                commentId = ((Number) resultObj).longValue();
            } else if (resultObj instanceof Object[]) {
                commentId = ((Number) ((Object[]) resultObj)[0]).longValue();
            }
            return new ApiResponseDTO(true, "Thêm bình luận thành công", commentId, null);
        } catch (UnexpectedRollbackException urex) {
            String message = extractRootCauseMessage(urex);
            return new ApiResponseDTO(false, message, null, "ADD_COMMENT_ERROR");
        } catch (Exception ex) {
            String message = ex.getMessage();
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
            return new ApiResponseDTO(false, message, null, "ADD_COMMENT_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO likeComment(Long commentId, Long userId) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_like_comment");
            query.registerStoredProcedureParameter("p_comment_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_user_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.setParameter("p_comment_id", commentId);
            query.setParameter("p_user_id", userId);
            query.execute();
            return new ApiResponseDTO(true, "Like bình luận thành công", null, null);
        } catch (UnexpectedRollbackException urex) {
            String message = extractRootCauseMessage(urex);
            return new ApiResponseDTO(false, message, null, "LIKE_COMMENT_ERROR");
        } catch (Exception ex) {
            String message = ex.getMessage();
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
            return new ApiResponseDTO(false, message, null, "LIKE_COMMENT_ERROR");
        }
    }

    @Transactional
    public ApiResponseDTO unlikeComment(Long commentId, Long userId) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_unlike_comment");
            query.registerStoredProcedureParameter("p_comment_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.registerStoredProcedureParameter("p_user_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.setParameter("p_comment_id", commentId);
            query.setParameter("p_user_id", userId);
            query.execute();
            return new ApiResponseDTO(true, "Unlike bình luận thành công", null, null);
        } catch (UnexpectedRollbackException urex) {
            String message = extractRootCauseMessage(urex);
            return new ApiResponseDTO(false, message, null, "UNLIKE_COMMENT_ERROR");
        } catch (Exception ex) {
            String message = ex.getMessage();
            return new ApiResponseDTO(false, message, null, "UNLIKE_COMMENT_ERROR");
        }
    }

    @Transactional(readOnly = true)
    public ApiResponseDTO getCommentsTree(Long postId) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_get_comments_tree");
            query.registerStoredProcedureParameter("p_post_id", Long.class, jakarta.persistence.ParameterMode.IN);
            query.setParameter("p_post_id", postId);
            List<Object[]> results = query.getResultList();
            List<Map<String, Object>> formattedResults = convertCommentsToKeyValue(results);
            return new ApiResponseDTO(true, "Lấy danh sách bình luận thành công", formattedResults, null);
        } catch (Exception ex) {
            String message = ex.getMessage();
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
            return new ApiResponseDTO(false, message, null, "GET_COMMENTS_ERROR");
        }
    }

    private List<Map<String, Object>> convertCommentsToKeyValue(List<Object[]> results) {
        List<Map<String, Object>> formattedResults = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> comment = new HashMap<>();
            comment.put("id", row[0]);
            comment.put("post_id", row[1]);
            comment.put("user_id", row[2]);
            comment.put("parent_id", row[3]);
            comment.put("content", row[4]);
            comment.put("likes_count", row[5]);
            comment.put("created_at", row[6]);
            comment.put("updated_at", row[7]);
            comment.put("user_name", row[8]);
            comment.put("user_avatar", row[9]);
            comment.put("level", row[10]);
            formattedResults.add(comment);
        }
        return formattedResults;
    }

    private String extractRootCauseMessage(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        String msg = cause.getMessage();
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
}

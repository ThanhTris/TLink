package com.example.backend.dto.request;

public class CommentCreateRequestDTO {
    private Long postId;
    private Long authorId;
    private Long parentId; // nullable
    private String content;
    private Long mentionUserId; // thêm trường này

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getMentionUserId() { return mentionUserId; }
    public void setMentionUserId(Long mentionUserId) { this.mentionUserId = mentionUserId; }
}

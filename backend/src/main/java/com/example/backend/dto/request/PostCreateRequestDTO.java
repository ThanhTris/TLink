package com.example.backend.dto.request;

import java.util.List;

public class PostCreateRequestDTO {
    private Long authorId; // đổi tên từ userId -> authorId
    private String title;
    private String content;
    private String parentTag; // Thêm trường này (tên tag cha)
    private List<String> childTags; // Thêm trường này (danh sách tên tag con)

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getParentTag() { return parentTag; }
    public void setParentTag(String parentTag) { this.parentTag = parentTag; }

    public List<String> getChildTags() { return childTags; }
    public void setChildTags(List<String> childTags) { this.childTags = childTags; }

    // Để tránh lỗi code cũ gọi getChildTagIds()
    public List<Long> getChildTagIds() {
        return null;
    }
    public void setChildTagIds(List<Long> ids) {
        // Không làm gì, chỉ để tránh lỗi compile cho code cũ
    }
}

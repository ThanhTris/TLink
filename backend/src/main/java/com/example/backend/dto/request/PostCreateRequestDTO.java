package com.example.backend.dto.request;

import java.util.List;

public class PostCreateRequestDTO {
    private Long userId;
    private String title;
    private String content;
    private List<Long> childTagIds; // Thêm trường này

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public List<Long> getChildTagIds() {
        return childTagIds;
    }

    public void setChildTagIds(List<Long> childTagIds) {
        this.childTagIds = childTagIds;
    }
}

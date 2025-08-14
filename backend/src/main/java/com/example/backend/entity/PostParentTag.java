package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_parent_tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostParentTag {
    @EmbeddedId
    private PostParentTagId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("postId")
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("parentTagId")
    @JoinColumn(name = "parent_tag_id")
    private ParentTag parentTag;
}

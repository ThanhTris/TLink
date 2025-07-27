package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_child_tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostChildTag {
    @EmbeddedId
    private PostChildTagId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("postId")
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("childTagId")
    @JoinColumn(name = "child_tag_id")
    private ChildTag childTag;
}

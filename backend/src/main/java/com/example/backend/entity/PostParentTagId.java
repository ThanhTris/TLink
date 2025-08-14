package com.example.backend.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostParentTagId implements Serializable {
    private Long postId;
    private Long parentTagId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PostParentTagId that = (PostParentTagId) o;
        return Objects.equals(postId, that.postId) && Objects.equals(parentTagId, that.parentTagId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, parentTagId);
    }
}

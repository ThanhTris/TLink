package com.example.backend.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostChildTagId implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long postId;
    private Long childTagId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PostChildTagId that = (PostChildTagId) o;
        return Objects.equals(postId, that.postId) && Objects.equals(childTagId, that.childTagId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, childTagId);
    }
}

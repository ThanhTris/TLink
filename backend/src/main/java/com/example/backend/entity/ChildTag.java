package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "child_tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChildTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_tag_id", nullable = false)
    private ParentTag parentTag;

    @OneToMany(mappedBy = "childTag", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PostChildTag> postChildTags;
}

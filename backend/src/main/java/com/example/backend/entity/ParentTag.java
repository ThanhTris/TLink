package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "parent_tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @OneToMany(mappedBy = "parentTag", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChildTag> childTags;
}

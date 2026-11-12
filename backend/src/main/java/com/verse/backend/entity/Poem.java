package com.verse.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "poems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Poem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 100)
    private String category; // e.g. Ghazal, Haiku, Sonnet, Free Verse

    @Column(length = 500)
    private String excerpt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Builder.Default
    private Integer likesCount = 0;

    @Builder.Default
    private Integer viewsCount = 0;

    @Builder.Default
    private Integer commentsCount = 0;

    // Score used to rank trending poems: composite of likes, views, recency
    @Builder.Default
    private Double trendingScore = 0.0;

    @Builder.Default
    private Boolean published = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

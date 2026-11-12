package com.verse.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 100)
    private String author;

    @Column(length = 100)
    private String type; // BOOK, COURSE, PRINT, MERCHANDISE

    @Builder.Default
    private Integer rating = 0; // 1-5, stored as integer (e.g. 45 = 4.5 stars)

    @Builder.Default
    private Integer reviewCount = 0;

    @Builder.Default
    private Boolean featured = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

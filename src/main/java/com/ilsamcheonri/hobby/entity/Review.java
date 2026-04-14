package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "REVIEW")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private ClassOrder order;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    public void deleteReview() {
        this.isDeleted = true;
    }
}
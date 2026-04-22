package com.ilsamcheonri.hobby.dto.review;

import com.ilsamcheonri.hobby.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long orderId;
    private Long classId;
    private String className;
    private String author;
    private Long userId;
    private Integer rating;
    private String content;
    private String createdAt;

    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .orderId(review.getOrder().getId())
                .classId(review.getOrder().getClassBoard().getId())
                .className(review.getOrder().getClassBoard().getTitle())
                .author(review.getOrder().getStudent().getName())
                .userId(review.getOrder().getStudent().getId())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt() != null ? review.getCreatedAt().toLocalDate().toString() : null)
                .build();
    }
}

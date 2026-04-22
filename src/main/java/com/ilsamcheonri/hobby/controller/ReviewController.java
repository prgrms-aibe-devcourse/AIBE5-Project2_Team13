package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.review.ReviewRequest;
import com.ilsamcheonri.hobby.dto.review.ReviewResponse;
import com.ilsamcheonri.hobby.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/me")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(reviewService.getMyReviews(email));
    }

    @GetMapping("/classes/{classId}")
    public ResponseEntity<List<ReviewResponse>> getClassReviews(@PathVariable Long classId) {
        return ResponseEntity.ok(reviewService.getClassReviews(classId));
    }

    @PostMapping("/orders/{orderId}")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal String email,
            @PathVariable Long orderId,
            @RequestBody @Valid ReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.createReview(email, orderId, request));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @AuthenticationPrincipal String email,
            @PathVariable Long reviewId,
            @RequestBody @Valid ReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.updateReview(email, reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal String email,
            @PathVariable Long reviewId
    ) {
        reviewService.deleteReview(email, reviewId);
        return ResponseEntity.ok().build();
    }
}

package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.review.ReviewRequest;
import com.ilsamcheonri.hobby.dto.review.ReviewResponse;
import com.ilsamcheonri.hobby.entity.ClassOrder;
import com.ilsamcheonri.hobby.entity.Review;
import com.ilsamcheonri.hobby.repository.ClassOrderRepository;
import com.ilsamcheonri.hobby.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ClassOrderRepository classOrderRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(String studentEmail) {
        return reviewRepository.findMyReviews(studentEmail)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getClassReviews(Long classId) {
        return reviewRepository.findClassReviews(classId)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional
    public ReviewResponse createReview(String studentEmail, Long orderId, ReviewRequest request) {
        ClassOrder order = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 내역입니다."));

        validateStudentOwnership(studentEmail, order);

        if (order.getProgressStatus() != ClassOrder.ProgressStatus.COMPLETED) {
            throw new IllegalStateException("수강 완료된 클래스만 리뷰를 작성할 수 있습니다.");
        }

        if (reviewRepository.existsByOrderIdAndIsDeletedFalse(orderId)) {
            throw new IllegalStateException("이미 작성한 리뷰가 있습니다.");
        }

        Review review = Review.builder()
                .order(order)
                .rating(request.getRating())
                .content(request.getContent().trim())
                .build();

        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateReview(String studentEmail, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findByIdAndIsDeletedFalse(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다."));

        validateStudentOwnership(studentEmail, review.getOrder());
        review.updateReview(request.getRating(), request.getContent().trim());

        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteReview(String studentEmail, Long reviewId) {
        Review review = reviewRepository.findByIdAndIsDeletedFalse(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다."));

        validateStudentOwnership(studentEmail, review.getOrder());
        review.deleteReview();
    }

    private void validateStudentOwnership(String studentEmail, ClassOrder order) {
        if (!order.getStudent().getEmail().equals(studentEmail)) {
            throw new IllegalStateException("본인 수강 내역의 리뷰만 처리할 수 있습니다.");
        }
    }
}

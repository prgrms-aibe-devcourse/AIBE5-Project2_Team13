package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

// 9. 리뷰 (ReviewRepository.java)
public interface ReviewRepository extends JpaRepository<Review, Long> {
}
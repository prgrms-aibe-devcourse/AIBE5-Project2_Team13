package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// 9. 리뷰 (ReviewRepository.java)
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByOrderIdAndIsDeletedFalse(Long orderId);

    Optional<Review> findByIdAndIsDeletedFalse(Long id);

    @Query("""
            select review
            from Review review
            join fetch review.order classOrder
            join fetch classOrder.classBoard classBoard
            join fetch classOrder.student student
            where student.email = :studentEmail
              and review.isDeleted = false
            order by review.createdAt desc
            """)
    List<Review> findMyReviews(@Param("studentEmail") String studentEmail);

    @Query("""
            select review
            from Review review
            join fetch review.order classOrder
            join fetch classOrder.classBoard classBoard
            join fetch classOrder.student student
            where classBoard.id = :classId
              and review.isDeleted = false
            order by review.createdAt desc
            """)
    List<Review> findClassReviews(@Param("classId") Long classId);
}

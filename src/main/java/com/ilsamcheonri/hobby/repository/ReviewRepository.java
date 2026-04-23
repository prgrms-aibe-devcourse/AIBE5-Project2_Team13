package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.dto.review.ClassReviewStats;
import com.ilsamcheonri.hobby.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// 9. 리뷰 (ReviewRepository.java)
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByOrderIdAndIsDeletedFalse(Long orderId);

    Optional<Review> findByIdAndIsDeletedFalse(Long id);

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 학생의 리뷰 목록을 조회합니다.
     * - 연관 엔티티(order, classBoard, student)를 fetch join으로 함께 조회
     * - 삭제되지 않은 데이터만 조회 후 최신순 정렬
     *
     * @param studentEmail 학생 이메일
     * @return 리뷰 목록
     */
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

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 클래스의 리뷰 목록을 조회합니다.
     * - order, classBoard, student를 fetch join으로 함께 조회
     * - 삭제되지 않은 리뷰만 조회 후 최신순 정렬
     *
     * @param classId 클래스 ID
     * @return 리뷰 목록
     */
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


    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 프리랜서의 클래스에 대한 리뷰 목록을 조회합니다.
     * - order, classBoard, student를 fetch join으로 함께 조회
     * - 삭제되지 않은 리뷰만 조회 후 최신순 정렬
     *
     * @param freelancerId 프리랜서 ID
     * @return 리뷰 목록
     */
    @Query("""
        select review
        from Review review
        join fetch review.order classOrder
        join fetch classOrder.classBoard classBoard
        join fetch classOrder.student student
        where classBoard.freelancer.id = :freelancerId
          and review.isDeleted = false
        order by review.createdAt desc
        """)
    List<Review> findFreelancerReviews(@Param("freelancerId") Long freelancerId);

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 여러 클래스의 리뷰 통계 정보를 조회합니다.
     * - 평균 평점(avg)과 리뷰 개수(count)를 클래스별로 집계
     * - 삭제되지 않은 리뷰만 대상
     *
     * @param classIds 클래스 ID 목록
     * @return 클래스별 평균 평점 및 리뷰 수
     */
    @Query("""
        select classBoard.id as classId,
               avg(review.rating) as averageRating,
               count(review.id) as reviewCount
        from Review review
        join review.order classOrder
        join classOrder.classBoard classBoard
        where classBoard.id in :classIds
          and review.isDeleted = false
        group by classBoard.id
        """)
    List<ClassReviewStats> findReviewStatsByClassIds(@Param("classIds") List<Long> classIds);

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 학생이 작성한 리뷰를 소프트 삭제합니다.
     * - 실제 삭제가 아닌 isDeleted = true로 상태 변경
     * - 이미 삭제된 데이터는 제외
     *
     * @param studentId 학생 ID
     * @return 삭제 처리된 리뷰 수
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update Review review
           set review.isDeleted = true
         where review.isDeleted = false
           and review.order.student.id = :studentId
        """)
    int softDeleteByStudentId(@Param("studentId") Long studentId);


    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 프리랜서의 클래스에 대한 리뷰를 소프트 삭제합니다.
     * - 프리랜서가 등록한 클래스에 연결된 리뷰 대상
     * - 상태값 변경 방식으로 삭제 처리
     *
     * @param freelancerId 프리랜서 ID
     * @return 삭제 처리된 리뷰 수
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update Review review
           set review.isDeleted = true
         where review.isDeleted = false
           and review.order.classBoard.freelancer.id = :freelancerId
        """)
    int softDeleteByFreelancerId(@Param("freelancerId") Long freelancerId);
}

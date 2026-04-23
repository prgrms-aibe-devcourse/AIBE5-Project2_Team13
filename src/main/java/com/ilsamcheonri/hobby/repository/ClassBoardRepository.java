package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassBoard;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassBoardRepository extends JpaRepository<ClassBoard, Long> {

    // ──────────────────────────────────────────
    // 기존 메서드 (OFFER 클래스 담당자 영역)
    // ──────────────────────────────────────────

    // 예를 들어 온라인 클래스만 따로 조회하고 싶을 때 활용할 수 있습니다.
    List<ClassBoard> findByIsOnlineTrue();

    // 특정 카테고리의 오프라인 클래스만 조회할 때
    List<ClassBoard> findByCategoryIdAndIsOnlineFalse(Long categoryId);

    // ──────────────────────────────────────────
    // 요청 클래스(REQUEST) 전용 메서드
    //
    // Spring Data JPA 네이밍 규칙:
    // findBy + 필드명 + And + 필드명 + ... 으로 메서드명을 작성하면
    // JPA가 자동으로 SQL 쿼리를 만들어 줍니다. (직접 SQL 작성 불필요!)
    // ──────────────────────────────────────────

    /**
     * boardType이 일치하고 삭제되지 않은 클래스 목록 조회
     * → SELECT * FROM CLASS_BOARD WHERE board_type = ? AND is_deleted = false
     */
    List<ClassBoard> findByBoardTypeAndIsDeletedFalseOrderByCreatedAtDesc(String boardType);

    List<ClassBoard> findByBoardTypeAndIsDeletedFalse(String boardType);

    /**
     * ID와 boardType이 일치하고 삭제되지 않은 클래스 단건 조회
     * → SELECT * FROM CLASS_BOARD WHERE id = ? AND board_type = ? AND is_deleted = false
     */
    Optional<ClassBoard> findByIdAndBoardTypeAndIsDeletedFalse(Long id, String boardType);

    /**
     * 특정 회원이 작성한 REQUEST 타입 클래스 목록 조회 (마이페이지용)
     * → SELECT * FROM CLASS_BOARD WHERE freelancer_id = ? AND board_type = ? AND is_deleted = false
     */
    List<ClassBoard> findByFreelancerIdAndBoardTypeAndIsDeletedFalse(Long freelancerId, String boardType);

    List<ClassBoard> findByFreelancerIdAndBoardTypeAndIsDeletedFalseOrderByCreatedAtDesc(Long freelancerId, String boardType);

    /**
     * N+1 문제 해결을 위한 JOIN FETCH 쿼리
     * boardType으로 필터링하면서 이미지 정보까지 한 번에 조회합니다.
     * 속도 향상을 위해 추가
     */
    @Query("SELECT DISTINCT cb FROM ClassBoard cb " +
            "LEFT JOIN FETCH cb.attachments a " +
            "WHERE cb.boardType = :boardType AND cb.isDeleted = false " +
            "ORDER BY cb.createdAt DESC")
    List<ClassBoard> findAllWithAttachmentsByBoardType(@Param("boardType") String boardType);

    // 마이페이지에>내 클래스 관리의 이미지 미리보기 속도 향상을 위해 추가
    @Query("SELECT DISTINCT cb FROM ClassBoard cb " +
            "LEFT JOIN FETCH cb.attachments a " +
            "WHERE cb.freelancer.id = :freelancerId " +
            "AND cb.isDeleted = false " +
            "ORDER BY cb.createdAt DESC")
    List<ClassBoard> findMyClassesWithAttachments(@Param("freelancerId") Long freelancerId);

    // 수강 신청 시 정원 경쟁 조건을 방지하기 위한 비관적 락 조회
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT cb FROM ClassBoard cb WHERE cb.id = :id AND cb.isDeleted = false")
    Optional<ClassBoard> findByIdForUpdate(@Param("id") Long id);

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 프리랜서가 등록한 클래스 게시글을 소프트 삭제합니다.
     * - 실제 삭제가 아닌 isDeleted = true로 상태만 변경
     * - 이미 삭제된 데이터(isDeleted = true)는 제외
     *
     * @param freelancerId 프리랜서 ID
     * @return 수정된(삭제 처리된) 게시글 수
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update ClassBoard classBoard
               set classBoard.isDeleted = true
             where classBoard.isDeleted = false
               and classBoard.freelancer.id = :freelancerId
            """)
    int softDeleteByFreelancerId(@Param("freelancerId") Long freelancerId);
}

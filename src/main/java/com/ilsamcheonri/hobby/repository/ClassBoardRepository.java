package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassBoard;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
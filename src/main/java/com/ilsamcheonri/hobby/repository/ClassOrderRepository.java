package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 7. 클래스 주문/결제
public interface ClassOrderRepository extends JpaRepository<ClassOrder, Long> {
    Optional<ClassOrder> findByStudentIdAndClassBoardIdAndIsDeletedFalse(Long studentId, Long classBoardId);

    // 취소되지 않은 데이터 중에서만 찾아라
    //클래스 취소 후 재신청 시 생기는 오류 해결 위해 추가
    boolean existsByStudentIdAndClassBoardIdAndIsDeletedFalse(Long studentId, Long classBoardId);

    @EntityGraph(attributePaths = {"classBoard"})
    List<ClassOrder> findByStudentIdAndIsDeletedFalseOrderByCreatedAtDesc(Long studentId);

    // 승인 상태가 PENDING(대기) 또는 APPROVED(승인)인 데이터가 있는지 확인
    boolean existsByStudentIdAndClassBoardIdAndApprovalStatusIn(
            Long studentId,
            Long classBoardId,
            List<ClassOrder.ApprovalStatus> statuses
    );
}
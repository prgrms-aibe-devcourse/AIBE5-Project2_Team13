package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 7. 클래스 주문/결제
public interface ClassOrderRepository extends JpaRepository<ClassOrder, Long> {
    Optional<ClassOrder> findByStudentIdAndClassBoardIdAndIsDeletedFalse(Long studentId, Long classBoardId);

    @EntityGraph(attributePaths = {"classBoard"})
    List<ClassOrder> findByStudentIdAndIsDeletedFalseOrderByCreatedAtDesc(Long studentId);
}
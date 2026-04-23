package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    // [기능 설명: 특정 학생의 ID와 진행 상태를 기반으로, 삭제되지 않은 클래스 주문 내역을 생성일 최신순으로 조회하며 관련 엔티티(classBoard, student)를 즉시 로딩합니다.] [작성 이유: 특정 상태(예: 수업 완료)의 수강 내역을 성능 저하 없이 효율적으로 조회하여 마이페이지 등에 표시하고 N+1 문제를 방지하기 위해 작성함]

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 학생의 신청 목록을 상태별로 조회합니다.
     * - 삭제되지 않은 데이터만 조회 (isDeleted = false)
     * - 최신순(createdAt desc)으로 정렬
     * - classBoard, student를 함께 조회하여 N+1 문제 방지
     *
     * @param studentId 학생 ID
     * @param progressStatus 신청 진행 상태
     * @return 조건에 해당하는 신청 목록
     */
    @EntityGraph(attributePaths = {"classBoard", "student"})
    @Query("""
            select classOrder
            from ClassOrder classOrder
            where classOrder.student.id = :studentId
              and classOrder.progressStatus = :progressStatus
              and classOrder.isDeleted = false
            order by classOrder.createdAt desc
            """)
    List<ClassOrder> findByStudentIdAndProgressStatusAndIsDeletedFalseOrderByCreatedAtDesc(
            @Param("studentId") Long studentId,
            @Param("progressStatus") ClassOrder.ProgressStatus progressStatus
    );

    // [기능 설명: 특정 프리랜서의 클래스 주문 중 지정된 승인 상태가 아니며 삭제되지 않은 항목들을 생성일 내림차순으로 조회합니다.] [작성 이유: 클래스 주문 관리 대시보드에서 관련 엔티티를 한 번에 효율적으로 조회하여 N+1 문제를 방지하기 위해 작성함]
    @EntityGraph(attributePaths = {"classBoard", "student"})
    List<ClassOrder> findByClassBoardFreelancerIdAndApprovalStatusNotAndIsDeletedFalseOrderByCreatedAtDesc(
            Long freelancerId,
            ClassOrder.ApprovalStatus approvalStatus
    );

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 프리랜서의 클래스 신청 목록을 승인 상태별로 조회합니다.
     * - 삭제되지 않은 데이터만 조회 후 생성일 기준 오름차순 정렬
     * - classBoard, student를 함께 조회하여 N+1 문제 방지
     *
     * @param freelancerId 프리랜서 ID
     * @param approvalStatuses 조회할 승인 상태 목록
     * @return 조건에 해당하는 신청 목록
     */
    @EntityGraph(attributePaths = {"classBoard", "student"})
    List<ClassOrder> findByClassBoardFreelancerIdAndApprovalStatusInAndIsDeletedFalseOrderByCreatedAtAsc(
            Long freelancerId,
            List<ClassOrder.ApprovalStatus> approvalStatuses
    );

    // [기능 설명: 삭제되지 않은 모든 클래스 주문 내역을 생성일 기준 최신순으로 조회하며, 관련된 클래스 정보와 학생 정보를 즉시 로딩합니다.] [작성 이유: 관리자 대시보드 등에서 전체 주문 현황을 성능 저하 없이 한 번에 조회하고 N+1 문제를 방지하기 위해 작성함]
    @EntityGraph(attributePaths = {"classBoard", "student"})
    List<ClassOrder> findByIsDeletedFalseOrderByCreatedAtDesc();

    // 승인 상태가 PENDING(대기) 또는 APPROVED(승인)인 데이터가 있는지 확인
    boolean existsByStudentIdAndClassBoardIdAndApprovalStatusIn(
            Long studentId,
            Long classBoardId,
            List<ClassOrder.ApprovalStatus> statuses
    );

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 학생의 클래스 신청 내역을 소프트 삭제합니다.
     * - 실제 삭제가 아닌 isDeleted = true로 상태 변경
     * - 이미 삭제된 데이터는 제외
     *
     * @param studentId 학생 ID
     * @return 삭제 처리된 신청 건수
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update ClassOrder classOrder
           set classOrder.isDeleted = true
         where classOrder.isDeleted = false
           and classOrder.student.id = :studentId
        """)
    int softDeleteByStudentId(@Param("studentId") Long studentId);


    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 프리랜서의 클래스에 대한 신청 내역을 소프트 삭제합니다.
     * - 프리랜서가 등록한 클래스에 연결된 모든 신청 대상
     * - 실제 삭제가 아닌 상태값 변경 방식
     *
     * @param freelancerId 프리랜서 ID
     * @return 삭제 처리된 신청 건수
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update ClassOrder classOrder
           set classOrder.isDeleted = true
         where classOrder.isDeleted = false
           and classOrder.classBoard.freelancer.id = :freelancerId
        """)
    int softDeleteByFreelancerId(@Param("freelancerId") Long freelancerId);
}

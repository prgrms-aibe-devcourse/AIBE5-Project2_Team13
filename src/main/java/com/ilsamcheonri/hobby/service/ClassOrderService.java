package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.classorder.ClassOrderRequest;
import com.ilsamcheonri.hobby.dto.classorder.ClassOrderSummaryResponse;
import com.ilsamcheonri.hobby.entity.ClassBoard;
import com.ilsamcheonri.hobby.entity.ClassOrder;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.repository.ClassBoardRepository;
import com.ilsamcheonri.hobby.repository.ClassOrderRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassOrderService {

    private final ClassOrderRepository classOrderRepository;
    private final ClassBoardRepository classBoardRepository;
    private final MemberRepository memberRepository;

    //수강 신청 처리
    @Transactional
    public Long applyClass(String studentEmail, ClassOrderRequest request) {
        // 1. 먼저 데이터를 가져옵니다. (조회 우선!)
        Member student = memberRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository.findByIdForUpdate(request.getClassBoardId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        // 2. 이제 가져온 student와 classBoard의 ID를 사용해서 중복 검증을 합니다.
        List<ClassOrder.ApprovalStatus> activeStatuses = List.of(
                ClassOrder.ApprovalStatus.PENDING,
                ClassOrder.ApprovalStatus.APPROVED
        );

        // PENDING(대기)이나 APPROVED(승인)인 내역이 있으면 신청 불가!
        if (classOrderRepository.existsByStudentIdAndClassBoardIdAndApprovalStatusIn(
                student.getId(), classBoard.getId(), activeStatuses)) {
            throw new IllegalStateException("이미 진행 중인 수강 신청 내역이 있습니다.");
        }

        // 3. 기존에 있던 마감 체크 로직
        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus())) {
            throw new IllegalStateException("이미 모집이 마감된 클래스입니다.");
        }

        // 4. 정원 체크 및 신청 진행
        int currentVolume = classBoard.getCurrentVolume() == null ? 0 : classBoard.getCurrentVolume();
        int maxCapacity = classBoard.getMaxCapacity() == null ? 0 : classBoard.getMaxCapacity();
        if (currentVolume >= maxCapacity) {
            classBoard.updateStatus("CLOSE");
            throw new IllegalStateException("정원이 마감된 클래스입니다.");
        }

        ClassOrder classOrder = ClassOrder.builder()
                .student(student)
                .classBoard(classBoard)
                .amount(classBoard.getPrice())
                .approvalStatus(ClassOrder.ApprovalStatus.PENDING)
                .progressStatus(ClassOrder.ProgressStatus.IN_PROGRESS)
                .build();

        ClassOrder saved = classOrderRepository.save(classOrder);
        classBoard.increaseVolume();

        // 5. 인원 증가 후 정원 마감 체크
        if (classBoard.getCurrentVolume() >= classBoard.getMaxCapacity()) {
            classBoard.updateStatus("CLOSE");
        }

        return saved.getId();
    }

    @Transactional(readOnly = true)
    public List<ClassOrderSummaryResponse> getMyClassOrders(String studentEmail) {
        Member student = memberRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return classOrderRepository.findByStudentIdAndIsDeletedFalseOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(ClassOrderSummaryResponse::from)
                .toList();
    }

    /**
     * 수강 신청 취소
     * 1) 주문 조회 2) 본인 확인 3) 상태 변경 4) 클래스 인원 감소
     */
    @Transactional
    public void cancelClassOrder(String studentEmail, Long orderId) {
        ClassOrder classOrder = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 신청 내역입니다."));

        if (!classOrder.getStudent().getEmail().equals(studentEmail)) {
            throw new IllegalStateException("본인의 수강 신청만 취소할 수 있습니다.");
        }

        if (classOrder.getApprovalStatus() == ClassOrder.ApprovalStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 수강 신청입니다.");
        }

        // 상태 업데이트
        classOrder.updateStatus(ClassOrder.ApprovalStatus.CANCELLED, ClassOrder.ProgressStatus.CANCELLED);

        // 클래스 인원 감소
        ClassBoard classBoard = classOrder.getClassBoard();
        classBoard.decreaseVolume();

        // 정원이 여유가 생겼으므로 다시 OPEN으로 변경 (기존에 정원 마감으로 CLOSE 되었을 경우)
        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus()) &&
            classBoard.getCurrentVolume() < classBoard.getMaxCapacity()) {
            classBoard.updateStatus("OPEN");
        }
    }
}

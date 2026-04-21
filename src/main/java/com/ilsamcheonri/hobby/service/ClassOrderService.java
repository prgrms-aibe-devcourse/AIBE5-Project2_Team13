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

    // [기능: 수강 신청 생성 처리] [이유: 신청 생성 시 class_order와 class_board의 진행 상태를 모두 BEFORE_START로 맞추기 위해]
    @Transactional
    public Long applyClass(String studentEmail, ClassOrderRequest request) {
        Member student = memberRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository.findByIdForUpdate(request.getClassBoardId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        List<ClassOrder.ApprovalStatus> activeStatuses = List.of(
                ClassOrder.ApprovalStatus.PENDING,
                ClassOrder.ApprovalStatus.APPROVED
        );

        if (classOrderRepository.existsByStudentIdAndClassBoardIdAndApprovalStatusIn(
                student.getId(), classBoard.getId(), activeStatuses)) {
            throw new IllegalStateException("이미 진행 중인 수강 신청 내역이 있습니다.");
        }

        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus())) {
            throw new IllegalStateException("이미 모집이 마감된 클래스입니다.");
        }

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
                .progressStatus(ClassOrder.ProgressStatus.BEFORE_START)
                .build();

        ClassOrder saved = classOrderRepository.save(classOrder);
        classBoard.updateProgressStatus(ClassBoard.ProgressStatus.BEFORE_START);
        classBoard.increaseVolume();

        if (classBoard.getCurrentVolume() >= classBoard.getMaxCapacity()) {
            classBoard.updateStatus("CLOSE");
        }

        return saved.getId();
    }

    // [기능: 학생 본인 수강 신청 내역 조회] [이유: 마이페이지 수강 관리 탭에 로그인한 학생의 신청 이력을 보여주기 위해]
    @Transactional(readOnly = true)
    public List<ClassOrderSummaryResponse> getMyClassOrders(String studentEmail) {
        Member student = memberRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return classOrderRepository.findByStudentIdAndIsDeletedFalseOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(ClassOrderSummaryResponse::from)
                .toList();
    }

    // [기능: 프리랜서 본인 클래스 신청 내역 조회] [이유: 마이페이지 수강생 관리 탭에서 본인 클래스 신청 이력을 보여주기 위해]
    @Transactional(readOnly = true)
    public List<ClassOrderSummaryResponse> getFreelancerClassOrders(String freelancerEmail) {
        Member freelancer = memberRepository.findByEmail(freelancerEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return classOrderRepository.findByClassBoardFreelancerIdAndApprovalStatusNotAndIsDeletedFalseOrderByCreatedAtDesc(
                        freelancer.getId(),
                        ClassOrder.ApprovalStatus.CANCELLED
                )
                .stream()
                .map(ClassOrderSummaryResponse::from)
                .toList();
    }

    // [기능: 프리랜서 수강 신청 승인 처리] [이유: 수강생 관리 탭의 승인 버튼으로 approval_status와 progress_status를 함께 갱신하기 위해]
    @Transactional
    public void approveClassOrder(String freelancerEmail, Long orderId) {
        ClassOrder classOrder = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 신청 내역입니다."));

        validateFreelancerOwnership(freelancerEmail, classOrder);
        classOrder.updateStatus(ClassOrder.ApprovalStatus.APPROVED, ClassOrder.ProgressStatus.IN_PROGRESS);
    }

    // [기능 설명: 수강 신청을 거절하고 관련 클래스의 수강 인원을 차감하며, 정원에 여유가 생기면 모집 상태를 'OPEN'으로 자동 변경합니다.] [작성 이유: 클래스 주문 반려 절차를 수행하고 정원 관리 로직을 통합하여 모집 현황을 정확하게 유지하기 위해 작성함]
    @Transactional
    public void rejectClassOrder(String freelancerEmail, Long orderId) {
        ClassOrder classOrder = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 신청 내역입니다."));

        validateFreelancerOwnership(freelancerEmail, classOrder);
        classOrder.updateStatus(ClassOrder.ApprovalStatus.REJECTED, ClassOrder.ProgressStatus.REJECTED);

        ClassBoard classBoard = classOrder.getClassBoard();
        classBoard.decreaseVolume();

        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus()) &&
                classBoard.getCurrentVolume() < classBoard.getMaxCapacity()) {
            classBoard.updateStatus("OPEN");
        }
    }

    // [기능: 수강 신청 취소 처리] [이유: 학생 본인이 신청 취소 시 주문 상태와 클래스 인원을 함께 갱신하기 위해]
    @Transactional
    public void cancelClassOrder(String studentEmail, Long orderId) {
        ClassOrder classOrder = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 신청 내역입니다."));

        if (!classOrder.getStudent().getEmail().equals(studentEmail)) {
            throw new IllegalStateException("본인 수강 신청만 취소할 수 있습니다.");
        }

        if (classOrder.getApprovalStatus() == ClassOrder.ApprovalStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 수강 신청입니다.");
        }

        classOrder.updateStatus(ClassOrder.ApprovalStatus.CANCELLED, ClassOrder.ProgressStatus.CANCELLED);

        ClassBoard classBoard = classOrder.getClassBoard();
        classBoard.decreaseVolume();

        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus()) &&
            classBoard.getCurrentVolume() < classBoard.getMaxCapacity()) {
            classBoard.updateStatus("OPEN");
        }
    }

    // [기능: 프리랜서 소유 클래스 검증] [이유: 본인 클래스 신청 건에 대해서만 승인·거절이 가능하도록 제한하기 위해]
    private void validateFreelancerOwnership(String freelancerEmail, ClassOrder classOrder) {
        if (!classOrder.getClassBoard().getFreelancer().getEmail().equals(freelancerEmail)) {
            throw new IllegalStateException("본인 클래스 신청 건만 처리할 수 있습니다.");
        }
    }
}

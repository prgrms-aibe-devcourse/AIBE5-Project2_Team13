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

    /**
     * 수강 신청 처리
     * 1) 클래스 조회/잠금 2) 정원 체크 3) 주문 저장 4) 클래스 인원 증가
     */
    @Transactional
    public Long applyClass(String studentEmail, ClassOrderRequest request) {
        Member student = memberRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository.findByIdForUpdate(request.getClassBoardId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus())) {
            throw new IllegalStateException("이미 모집이 마감된 클래스입니다.");
        }

        int currentVolume = classBoard.getCurrentVolume() == null ? 0 : classBoard.getCurrentVolume();
        int maxCapacity = classBoard.getMaxCapacity() == null ? 0 : classBoard.getMaxCapacity();
        if (currentVolume >= maxCapacity) {
            // 정원이 이미 차있는데 상태만 OPEN인 경우를 대비해 여기서도 상태 업데이트를 시도합니다.
            classBoard.updateStatus("CLOSE");
            throw new IllegalStateException("정원이 마감된 클래스입니다.");
        }

        classOrderRepository.findByStudentIdAndClassBoardIdAndIsDeletedFalse(student.getId(), classBoard.getId())
                .ifPresent(order -> {
                    throw new IllegalStateException("이미 신청한 클래스입니다.");
                });

        ClassOrder classOrder = ClassOrder.builder()
                .student(student)
                .classBoard(classBoard)
                .amount(classBoard.getPrice())
                .approvalStatus(ClassOrder.ApprovalStatus.PENDING)
                .progressStatus(ClassOrder.ProgressStatus.IN_PROGRESS)
                .build();

        ClassOrder saved = classOrderRepository.save(classOrder);
        classBoard.increaseVolume();

        // 정원이 꽉 찼는지 체크하여 상태 변경
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
}

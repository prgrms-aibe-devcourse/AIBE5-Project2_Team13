package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.classboard.ClassBoardCreateRequest;
import com.ilsamcheonri.hobby.dto.classboard.ClassBoardResponse;
import com.ilsamcheonri.hobby.entity.Category;
import com.ilsamcheonri.hobby.entity.ClassBoard;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.repository.CategoryRepository;
import com.ilsamcheonri.hobby.repository.ClassBoardRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassBoardService {

    private final ClassBoardRepository classBoardRepository;
    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;

    public List<ClassBoardResponse> getOfferClassList() {
        return classBoardRepository.findByBoardTypeAndIsDeletedFalseOrderByCreatedAtDesc("OFFER")
                .stream()
                .map(ClassBoardResponse::from)
                .collect(Collectors.toList());
    }

    public ClassBoardResponse getOfferClass(Long id) {
        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        return ClassBoardResponse.from(classBoard);
    }

    @Transactional
    public Long createOfferClass(String email, ClassBoardCreateRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        if (request.getEndAt().isBefore(request.getStartAt())) {
            throw new IllegalArgumentException("종료 일시는 시작 일시보다 이후여야 합니다.");
        }

        ClassBoard offerClass = ClassBoard.builder()
                .freelancer(member)
                .category(category)
                .boardType("OFFER")
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice() != null ? request.getPrice() : 0)
                .isOnline(request.getIsOnline())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .maxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity() : 1)
                .status("OPEN")
                .curriculum(request.getCurriculum())
                .location(request.getLocation())
                .build();

        return classBoardRepository.save(offerClass).getId();
    }

    
    @Transactional
    // 개설된 클래스의 정보를 수정하는 기능
    public Long updateOfferClass(String email, Long id, ClassBoardCreateRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        // 권한 검증
        if (!classBoard.getFreelancer().getId().equals(member.getId())) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        if (request.getEndAt() != null && request.getStartAt() != null && 
            request.getEndAt().isBefore(request.getStartAt())) {
            throw new IllegalArgumentException("종료 일시는 시작 일시보다 이후여야 합니다.");
        }

        // 카테고리 준비
        Category category = classBoard.getCategory();
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));
        }

        // 온/오프라인 및 위치 정보 로직 처리
        boolean isOnline = request.getIsOnline() != null ? request.getIsOnline() : classBoard.isOnline();
        String location = classBoard.getLocation();
        if (request.getIsOnline() != null) {
            if (request.getIsOnline()) {
                location = null;
            } else if (request.getLocation() != null) {
                location = request.getLocation();
            }
        } else if (request.getLocation() != null) {
            location = request.getLocation();
        }

        // 통합 업데이트 메서드 호출
        classBoard.updateOfferClass(
                category,
                request.getTitle() != null ? request.getTitle() : classBoard.getTitle(),
                request.getDescription() != null ? request.getDescription() : classBoard.getDescription(),
                request.getPrice() != null ? request.getPrice() : classBoard.getPrice(),
                isOnline,
                request.getStartAt() != null ? request.getStartAt() : classBoard.getStartAt(),
                request.getEndAt() != null ? request.getEndAt() : classBoard.getEndAt(),
                request.getMaxCapacity() != null ? request.getMaxCapacity() : classBoard.getMaxCapacity(),
                request.getCurriculum() != null ? request.getCurriculum() : classBoard.getCurriculum(),
                location
        );

        return classBoard.getId();
    }

    @Transactional
    // 개설된 클래스를 소프트 삭제(is_deleted=1) 처리하는 기능
    public void deleteOfferClass(String email, Long id) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        // 권한 검증: 작성자만 삭제 가능
        if (!classBoard.getFreelancer().getId().equals(member.getId())) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        classBoard.softDelete();
    }

    /**
     * 클래스 모집 상태 토글 (OPEN <-> CLOSE)
     */
    @Transactional
    // 클래스의 모집 상태를 반전(토글)시키는 기능
    public String toggleStatus(String email, Long id) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        // 권한 검증
        if (!classBoard.getFreelancer().getId().equals(member.getId())) {
            throw new IllegalArgumentException("상태 변경 권한이 없습니다.");
        }

        // 상태 전환 로직
        String currentStatus = classBoard.getStatus();
        String nextStatus = "OPEN".equals(currentStatus) ? "CLOSE" : "OPEN";
        classBoard.updateStatus(nextStatus);
        classBoardRepository.save(classBoard);

        return nextStatus;
    }
}

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
    public Long updateOfferClass(String email, Long id, ClassBoardCreateRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        // 권한 검증: 작성자만 수정 가능
        if (!classBoard.getFreelancer().getId().equals(member.getId())) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        if (request.getEndAt() != null && request.getStartAt() != null && 
            request.getEndAt().isBefore(request.getStartAt())) {
            throw new IllegalArgumentException("종료 일시는 시작 일시보다 이후여야 합니다.");
        }

        // 필드 업데이트
        if (request.getTitle() != null) {
            classBoard.updateTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            classBoard.updateDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            classBoard.updatePrice(request.getPrice());
        }
        if (request.getIsOnline() != null) {
            classBoard.updateIsOnline(request.getIsOnline());
        }
        if (request.getStartAt() != null) {
            classBoard.updateStartAt(request.getStartAt());
        }
        if (request.getEndAt() != null) {
            classBoard.updateEndAt(request.getEndAt());
        }
        if (request.getMaxCapacity() != null) {
            classBoard.updateMaxCapacity(request.getMaxCapacity());
        }
        if (request.getCurriculum() != null) {
            classBoard.updateCurriculum(request.getCurriculum());
        }
        if (request.getLocation() != null) {
            classBoard.updateLocation(request.getLocation());
        }

        return classBoard.getId();
    }
}

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
}

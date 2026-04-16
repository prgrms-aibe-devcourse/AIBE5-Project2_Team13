package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.entity.ClassBoard;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.entity.WishList;
import com.ilsamcheonri.hobby.repository.ClassBoardRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import com.ilsamcheonri.hobby.repository.WishListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 📋 찜(WishList) 비즈니스 로직을 담당하는 Service
 *
 * 기능:
 * 1. 찜 등록       — WISH_LIST 테이블에 row 추가
 * 2. 찜 취소       — WISH_LIST 테이블에서 row 실제 삭제 (소프트 삭제 아님)
 * 3. 찜 여부 조회  — 상세 페이지에서 하트 상태 확인
 * 4. 찜 ID 목록    — 목록 화면에서 찜한 classId 일괄 확인
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishListService {

    private final WishListRepository wishListRepository;
    private final MemberRepository memberRepository;
    private final ClassBoardRepository classBoardRepository;

    // =========================================================
    // ✅ 1. 찜 등록
    // =========================================================
    @Transactional
    public void addWish(String email, Long classId) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        if (wishListRepository.existsByMemberIdAndClassBoardId(member.getId(), classId)) {
            throw new IllegalStateException("이미 찜한 클래스입니다.");
        }

        wishListRepository.save(WishList.builder()
                .member(member)
                .classBoard(classBoard)
                .build());
    }

    // =========================================================
    // ✅ 2. 찜 취소 (실제 삭제)
    // =========================================================

    /**
     * WISH_LIST 테이블에는 is_deleted 컬럼이 없으므로 실제 DELETE 처리합니다.
     */
    @Transactional
    public void removeWish(String email, Long classId) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        WishList wish = wishListRepository
                .findByMemberIdAndClassBoardId(member.getId(), classId)
                .orElseThrow(() -> new IllegalArgumentException("찜 목록에 없는 클래스입니다."));

        wishListRepository.delete(wish);
    }

    // =========================================================
    // ✅ 3. 찜 여부 조회 (상세 페이지용)
    // =========================================================
    public boolean isWished(String email, Long classId) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return wishListRepository.existsByMemberIdAndClassBoardId(member.getId(), classId);
    }

    // =========================================================
    // 4. 내 찜 classId 목록 조회 (목록 화면용)
    // =========================================================

    /**
     * 로그인한 사용자가 찜한 클래스 ID 목록을 반환합니다.
     * 목록 화면에서 한 번만 호출해서 카드마다 찜 여부를 일괄 확인합니다.
     */
    public List<Long> getWishedClassIds(String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return wishListRepository.findByMemberId(member.getId())
                .stream()
                .map(wish -> wish.getClassBoard().getId())
                .collect(Collectors.toList());
    }
}

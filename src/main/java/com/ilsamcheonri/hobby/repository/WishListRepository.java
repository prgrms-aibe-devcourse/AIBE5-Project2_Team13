package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.WishList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishListRepository extends JpaRepository<WishList, Long> {

    Optional<WishList> findByMemberIdAndClassBoardId(Long memberId, Long classBoardId);

    boolean existsByMemberIdAndClassBoardId(Long memberId, Long classBoardId);

    /**
     * 특정 회원의 찜 목록 전체 조회
     * → 목록 화면에서 찜한 classId Set을 만드는 데 사용
     */
    List<WishList> findByMemberId(Long memberId);
}
package com.ilsamcheonri.hobby.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberSummaryDto {
    // 본인 여부 판단용 — 팔로우 버튼 노출 제어에 사용 - 최준열 수정
    private Long id;
    private String name;
    private String role;

    // ✅ 기존 생성자 유지 — 기존 코드에서 사용 중인 곳이 있을 수 있으므로 절대 삭제 금지
    public MemberSummaryDto(String name, String role) {
        this.name = name;
        this.role = role;
    }

    // ✅ id 포함 생성자 추가 — MemberRepository JPQL 쿼리에서 사용 - 최준열 추가
    public MemberSummaryDto(Long id, String name, String role) {
        this.id   = id;
        this.name = name;
        this.role = role;
    }
}
